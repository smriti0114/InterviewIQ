import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.session import Base, get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User

TEST_DATABASE_URL = "sqlite:///./test_interviewiq.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_interviewiq.db"):
        try:
            os.remove("./test_interviewiq.db")
        except Exception:
            pass


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_user(db_session):
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test User",
        is_active=True,
        default_preferences={"theme": "light"}
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, auth_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "password123"}
    )
    data = response.json()
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_user(db_session):
    user = User(
        email="otheruser@example.com",
        hashed_password=get_password_hash("otherpassword123"),
        full_name="Other User",
        is_active=True,
        default_preferences={"theme": "dark"}
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def other_auth_headers(client, other_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "otheruser@example.com", "password": "otherpassword123"}
    )
    data = response.json()
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}
