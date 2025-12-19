"""Main FastAPI application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.config import settings
from app.api.routes import upload, audio, tasks
from app.services.storage_service import storage_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager

    Handles startup and shutdown events
    """
    # Startup
    print("Starting Audio Processor API...")

    # Create storage directories
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    settings.processed_dir.mkdir(parents=True, exist_ok=True)

    # Start background cleanup task (optional)
    # cleanup_task = asyncio.create_task(run_cleanup_loop())

    yield

    # Shutdown
    print("Shutting down Audio Processor API...")
    # cleanup_task.cancel()


async def run_cleanup_loop():
    """Background task to clean up old files periodically"""
    while True:
        await asyncio.sleep(3600)  # Run every hour
        try:
            await storage_service.cleanup_old_files(max_age_hours=24)
        except Exception as e:
            print(f"Cleanup error: {e}")


# Create FastAPI app
app = FastAPI(
    title="Audio Processor API",
    description="API for audio separation, pitch transposition, and tempo modification",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Audio Processor API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
