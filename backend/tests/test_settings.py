import os
import pytest
from unittest.mock import patch, AsyncMock
from app.services.llm_service import llm_service, GeminiProvider


def test_settings_config_status_endpoint(client):
    response = client.get("/api/settings/config-status")
    assert response.status_code == 200
    data = response.json()
    assert "provider" in data
    assert "model" in data
    assert "api_key_configured" in data
    assert "connection_status" in data
    assert "mode" in data
    assert "message" in data
    # Backwards compatibility fields
    assert "llm_provider" in data
    assert "is_configured" in data


def test_test_llm_connection_missing_key(client):
    with patch.dict(os.environ, {}, clear=True), \
         patch.object(llm_service, "api_key", None), \
         patch.object(llm_service, "_provider", None):
        response = client.post("/api/settings/test-llm-connection")
        assert response.status_code == 200
        data = response.json()
        assert data["api_key_configured"] is False
        assert data["connection_status"] == "missing_key"
        assert data["mode"] == "simulated"
        assert "No API key" in data["message"]


@pytest.mark.asyncio
async def test_gemini_connection_success(client):
    mock_verify = AsyncMock(return_value={
        "status": "connected",
        "message": "Gemini API connection successful (gemini-2.5-flash)"
    })

    with patch.dict(os.environ, {"LLM_API_KEY": "AIzaSyTestKey1234567890", "LLM_PROVIDER": "gemini"}), \
         patch.object(GeminiProvider, "verify_connection", mock_verify):

        response = client.post("/api/settings/test-llm-connection")
        assert response.status_code == 200
        data = response.json()
        assert data["api_key_configured"] is True
        assert data["connection_status"] == "connected"
        assert data["mode"] == "live"
        assert "successful" in data["message"]


@pytest.mark.asyncio
async def test_gemini_connection_auth_error(client):
    mock_verify = AsyncMock(return_value={
        "status": "authentication_error",
        "message": "Invalid Gemini API key: API key not valid."
    })

    with patch.dict(os.environ, {"LLM_API_KEY": "AIzaSyBadKey1234567890", "LLM_PROVIDER": "gemini"}), \
         patch.object(GeminiProvider, "verify_connection", mock_verify):

        response = client.post("/api/settings/test-llm-connection")
        assert response.status_code == 200
        data = response.json()
        assert data["api_key_configured"] is True
        assert data["connection_status"] == "authentication_error"
        assert data["mode"] == "simulated"
        assert "Invalid" in data["message"]


@pytest.mark.asyncio
async def test_gemini_connection_quota_exceeded(client):
    mock_verify = AsyncMock(return_value={
        "status": "quota_exceeded",
        "message": "Gemini API quota exhausted or rate limit reached"
    })

    with patch.dict(os.environ, {"LLM_API_KEY": "AIzaSyQuotaKey1234567890", "LLM_PROVIDER": "gemini"}), \
         patch.object(GeminiProvider, "verify_connection", mock_verify):

        response = client.post("/api/settings/test-llm-connection")
        assert response.status_code == 200
        data = response.json()
        assert data["connection_status"] == "quota_exceeded"
        assert data["mode"] == "simulated"


@pytest.mark.asyncio
async def test_gemini_connection_invalid_model(client):
    mock_verify = AsyncMock(return_value={
        "status": "invalid_model",
        "message": "Configured Gemini model 'non-existent-model' not found in Gemini API catalog."
    })

    with patch.dict(os.environ, {"LLM_API_KEY": "AIzaSyValidKey1234567890", "LLM_PROVIDER": "gemini"}), \
         patch.object(GeminiProvider, "verify_connection", mock_verify):

        response = client.post("/api/settings/test-llm-connection")
        assert response.status_code == 200
        data = response.json()
        assert data["connection_status"] == "invalid_model"
        assert data["mode"] == "simulated"


@pytest.mark.asyncio
async def test_gemini_connection_network_error(client):
    mock_verify = AsyncMock(return_value={
        "status": "connection_error",
        "message": "Network error connecting to Gemini API: ConnectTimeout"
    })

    with patch.dict(os.environ, {"LLM_API_KEY": "AIzaSyValidKey1234567890", "LLM_PROVIDER": "gemini"}), \
         patch.object(GeminiProvider, "verify_connection", mock_verify):

        response = client.post("/api/settings/test-llm-connection")
        assert response.status_code == 200
        data = response.json()
        assert data["connection_status"] == "connection_error"
        assert data["mode"] == "simulated"


def test_auth_status_endpoint_backwards_compatible(client):
    response = client.get("/api/auth/config-status")
    assert response.status_code == 200
    data = response.json()
    assert "llm_provider" in data
    assert "is_configured" in data
    assert "connection_status" in data


def test_health_endpoint_includes_status(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "llm_provider" in data
    assert "connection_status" in data
    assert "mode" in data
