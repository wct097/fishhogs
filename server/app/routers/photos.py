from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
import shutil
from datetime import datetime, timedelta
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

@router.post("/presigned-url", response_model=schemas.PresignedUrlResponse)
async def get_presigned_url(
    request: schemas.PresignedUrlRequest,
    current_user: models.User = Depends(get_current_user)
):
    # Mock presigned URL for local development
    # In production, would use AWS S3 presigned URLs
    photo_id = str(uuid.uuid4())
    
    # Mock URL that points to our upload endpoint
    upload_url = f"http://localhost:8000/photos/upload/{photo_id}?filename={request.filename}"
    
    return {
        "upload_url": upload_url,
        "photo_id": photo_id,
        "expires_in": 3600  # 1 hour
    }

@router.post("/upload/{photo_id}")
async def upload_photo(
    photo_id: str,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check file size
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE} bytes",
            headers={"X-Error-Code": "4003"}
        )
    
    # Save file locally (mock S3)
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    
    file_path = upload_dir / f"{photo_id}.jpg"
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file"
        )
    
    return {
        "photo_id": photo_id,
        "s3_key": f"photos/{photo_id}.jpg",
        "status": "uploaded"
    }

@router.get("/download/{photo_id}")
async def download_photo(
    photo_id: str,
    current_user: models.User = Depends(get_current_user)
):
    # Serve photo from local storage
    file_path = Path(settings.UPLOAD_DIR) / f"{photo_id}.jpg"
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path, media_type="image/jpeg")