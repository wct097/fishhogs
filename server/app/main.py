from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from pathlib import Path

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