import json
import os
from pathlib import Path
from typing import List, Optional, Union
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve backend application directory reliably
# backend/app/core/config.py -> parent(core) -> parent(app) -> parent(backend)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent

BACKEND_ENV_PATH = BACKEND_DIR / ".env"
ROOT_ENV_PATH = ROOT_DIR / ".env"

# Load backend/.env first without overriding explicit system environment variables
if BACKEND_ENV_PATH.is_file():
    load_dotenv(dotenv_path=BACKEND_ENV_PATH, override=False)
elif ROOT_ENV_PATH.is_file():
    load_dotenv(dotenv_path=ROOT_ENV_PATH, override=False)

# Collect env file paths to supply to Pydantic Settings
ENV_FILES: List[str] = []
if BACKEND_ENV_PATH.is_file():
    ENV_FILES.append(str(BACKEND_ENV_PATH))
if ROOT_ENV_PATH.is_file() and ROOT_ENV_PATH != BACKEND_ENV_PATH:
    ENV_FILES.append(str(ROOT_ENV_PATH))


class Settings(BaseSettings):
    PROJECT_NAME: str = "InterviewIQ"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str = "sqlite:///./interviewiq.db"

    # JWT Auth
    JWT_SECRET_KEY: str = "interviewiq_super_secret_jwt_key_change_in_production_92837482"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini", "openai", "groq", "mock"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: Optional[str] = "gemini-2.5-flash"
    LLM_BASE_URL: Optional[str] = None

    # Rate Limiting
    RATE_LIMIT_GENERATE_PER_MINUTE: int = 15

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    model_config = SettingsConfigDict(
        env_file=tuple(ENV_FILES) if ENV_FILES else (str(BACKEND_ENV_PATH), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("LLM_PROVIDER", mode="before")
    def validate_provider(cls, v):
        if isinstance(v, str):
            clean = v.strip().lower()
            if clean in ("gemini", "google", "openai", "groq", "mock"):
                return clean
            return clean
        return "gemini"

    @field_validator("LLM_API_KEY", mode="before")
    def clean_api_key(cls, v, info):
        # 1. Clean the provided string if non-empty
        if isinstance(v, str):
            clean = v.strip()
            # If quotes wrap the key, strip them
            if (clean.startswith('"') and clean.endswith('"')) or (clean.startswith("'") and clean.endswith("'")):
                clean = clean[1:-1].strip()
            if clean and clean.lower() not in ("none", "null", "undefined", "empty"):
                return clean

        # 2. Check environment aliases as fallback if LLM_API_KEY was empty or None
        data = info.data if hasattr(info, "data") else {}
        provider = (data.get("LLM_PROVIDER") or os.getenv("LLM_PROVIDER", "gemini")).lower()
        if provider in ("gemini", "google"):
            gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if gemini_key and gemini_key.strip():
                return gemini_key.strip()
        elif provider in ("openai", "groq"):
            openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
            if openai_key and openai_key.strip():
                return openai_key.strip()

        return None

    @field_validator("LLM_MODEL", mode="before")
    def set_default_model(cls, v, info):
        if isinstance(v, str) and v.strip():
            clean = v.strip()
            if clean.lower() not in ("none", "null", "undefined", "empty"):
                return clean
        data = info.data if hasattr(info, "data") else {}
        provider = (data.get("LLM_PROVIDER") or os.getenv("LLM_PROVIDER", "gemini")).lower()
        if provider in ("gemini", "google"):
            return "gemini-2.5-flash"
        elif provider == "openai":
            return "gpt-4o-mini"
        elif provider == "groq":
            return "llama-3.3-70b-versatile"
        return "gemini-2.5-flash"


def reload_settings() -> Settings:
    """Re-read backend .env file and return fresh Settings instance."""
    # Preserve non-empty system environment variables as source of truth
    if not os.getenv("LLM_API_KEY"):
        if BACKEND_ENV_PATH.is_file():
            load_dotenv(dotenv_path=BACKEND_ENV_PATH, override=True)
        elif ROOT_ENV_PATH.is_file():
            load_dotenv(dotenv_path=ROOT_ENV_PATH, override=True)
    return Settings()


get_settings = reload_settings



settings = Settings()
