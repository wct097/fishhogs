from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from pathlib import Path
from datetime import datetime
from sqlalchemy import text

from app.database import engine, Base
from app.routers import auth, sync, photos
from app.config import settings

# Create uploads directory
Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown

app = FastAPI(
    title="Fishing Tracker API",
    version="0.3.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(sync.router, prefix="/sync", tags=["sync"])
app.include_router(photos.router, prefix="/photos", tags=["photos"])

@app.get("/")
def read_root():
    return {"status": "ok", "version": "0.3.0"}

@app.get("/health")
def health_check():
    """Basic health check endpoint"""
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "healthy",
            "database": db_status,
            "storage": "healthy" if Path(settings.UPLOAD_DIR).exists() else "unhealthy"
        }
    }

@app.get("/api/health", status_code=status.HTTP_200_OK)
def api_health():
    """API health check for monitoring"""
    return {
        "status": "ok",
        "backend": "running",
        "version": "0.3.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/readiness")
def readiness_check():
    """Kubernetes-style readiness probe"""
    try:
        # Check if database is accessible
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Check if required directories exist
        if not Path(settings.UPLOAD_DIR).exists():
            return {"status": "not ready", "reason": "upload directory missing"}, 503
        
        return {"status": "ready"}
    except Exception as e:
        return {"status": "not ready", "reason": str(e)}, 503

@app.get("/liveness")
def liveness_check():
    """Kubernetes-style liveness probe"""
    return {"status": "alive"}