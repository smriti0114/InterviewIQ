from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    default_preferences: Optional[Dict[str, Any]] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    default_preferences: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    sub: Optional[str] = None


from pydantic import model_validator


class ApiConfigStatus(BaseModel):
    provider: str
    model: str
    api_key_configured: bool
    connection_status: str  # "missing_key", "configured", "connected", "authentication_error", "quota_exceeded", "invalid_model", "connection_error"
    mode: str = "simulated"  # "live" or "simulated"
    message: str

    # Backwards compatibility fields for legacy callers/tests
    llm_provider: str = ""
    llm_model: str = ""
    is_configured: bool = False
    has_api_key: bool = False

    @model_validator(mode="before")
    def sync_backwards_fields(cls, values):
        if isinstance(values, dict):
            provider = values.get("provider") or values.get("llm_provider") or "Gemini"
            model = values.get("model") or values.get("llm_model") or "gemini-2.5-flash"
            key_configured = values.get("api_key_configured")
            if key_configured is None:
                key_configured = values.get("is_configured", False) or values.get("has_api_key", False)

            conn_status = values.get("connection_status") or ("configured" if key_configured else "missing_key")
            mode = values.get("mode") or ("live" if (key_configured and conn_status in ("configured", "connected")) else "simulated")

            values["provider"] = provider
            values["model"] = model
            values["api_key_configured"] = bool(key_configured)
            values["connection_status"] = conn_status
            values["mode"] = mode
            values["llm_provider"] = provider
            values["llm_model"] = model
            values["is_configured"] = bool(key_configured)
            values["has_api_key"] = bool(key_configured)
        return values

