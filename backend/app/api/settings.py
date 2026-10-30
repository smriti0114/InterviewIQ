from fastapi import APIRouter
from app.schemas.user import ApiConfigStatus
from app.services.llm_service import llm_service

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/config-status", response_model=ApiConfigStatus)
def get_config_status():
    """Returns safe LLM provider configuration and connection status."""
    return llm_service.get_api_status()


@router.post("/test-llm-connection", response_model=ApiConfigStatus)
async def test_llm_connection():
    """Performs live lightweight LLM connectivity verification."""
    return await llm_service.test_connection()
