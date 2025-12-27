from app.core.boot import apply_fixes, HAS_OMEGACONF
# Apply fixes before any other logic that might trigger torch operations
apply_fixes()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router
from app.core.config import DEFAULT_QUALITY, CORS_ORIGINS
from app.services.model_manager import get_model
from app.core.logging import get_logger

logger = get_logger("whisperx-server")

def create_app() -> FastAPI:
    app = FastAPI(title="WhisperX Server", version="1.1.0")
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(router)
    
    @app.on_event("startup")
    def _startup():
        logger.info("Starting WhisperX Server")
        # Optional preload to reduce cold start
        get_model(DEFAULT_QUALITY)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error: %s", exc)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
        
    return app

app = create_app()
