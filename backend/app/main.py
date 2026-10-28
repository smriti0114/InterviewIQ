import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.init_db import init_db
from app.api import api_router
from app.services.llm_service import llm_service

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("interviewiq")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite database tables are created
    logger.info("Initializing database...")
    init_db()
    logger.info(f"InterviewIQ API v{settings.VERSION} started.")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER} (API key configured: {bool(settings.LLM_API_KEY)})")
    yield
    logger.info("InterviewIQ API shutting down.")


app = FastAPI(
    title="InterviewIQ — AI-Based Interview Question Generator API",
    description="Enterprise-grade AI system for generating structured technical and HR interview questions, model answers, and scoring rubrics.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for deployment monitoring."""
    api_status = llm_service.get_api_status()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected",
        "llm_provider": api_status.llm_provider,
        "llm_configured": api_status.is_configured
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to InterviewIQ API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }


# Include all API routes under /api
app.include_router(api_router, prefix=settings.API_V1_STR)
