from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.interviews import router as interviews_router
from app.api.exports import router as exports_router
from app.api.settings import router as settings_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(interviews_router)
api_router.include_router(exports_router)
api_router.include_router(settings_router)
