def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New Recruiter"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "New Recruiter"


def test_register_duplicate_email(client, auth_user):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "anotherpassword123",
            "full_name": "Duplicate"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client, auth_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@example.com"


def test_login_invalid_password(client, auth_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_protected_me_without_auth(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_read_me_with_auth(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"


def test_update_profile(client, auth_headers):
    response = client.put(
        "/api/auth/me",
        headers=auth_headers,
        json={
            "full_name": "Updated Recruiter Name",
            "default_preferences": {"theme": "dark", "default_difficulty": "Hard"}
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Recruiter Name"
    assert data["default_preferences"]["theme"] == "dark"


def test_change_password(client, auth_headers):
    # Change password
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "password123",
            "new_password": "brandnewpassword456"
        }
    )
    assert response.status_code == 200

    # Verify new password works
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "brandnewpassword456"}
    )
    assert login_resp.status_code == 200


def test_api_config_status(client):
    response = client.get("/api/auth/config-status")
    assert response.status_code == 200
    data = response.json()
    assert "llm_provider" in data
    assert "is_configured" in data
