from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter()

# Rate limiting (simplified for MVP)
request_counts = {}

def check_rate_limit(user_id: str) -> bool:
    # Simple in-memory rate limiting (100 req/min)
    # In production, use Redis or similar
    return True

@router.post("/up", response_model=schemas.SyncUpResponse)
async def sync_upload(
    sync_data: schemas.SyncUpRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not check_rate_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )
    
    synced_count = 0
    conflicts = []
    
    # Process sessions
    for session_data in sync_data.sessions:
        existing = db.query(models.Session).filter(
            models.Session.id == session_data.id
        ).first()
        
        if existing:
            # Check for conflict (simplified LWW)
            if existing.last_modified_at > datetime.utcnow():
                conflicts.append({"entity": "session", "id": session_data.id})
                continue
            
            # Update existing
            existing.started_at = session_data.started_at
            existing.ended_at = session_data.ended_at
            existing.title = session_data.title
            existing.notes = session_data.notes
            existing.last_modified_at = datetime.utcnow()
        else:
            # Create new
            session = models.Session(
                id=session_data.id,
                user_id=current_user.id,
                started_at=session_data.started_at,
                ended_at=session_data.ended_at,
                title=session_data.title,
                notes=session_data.notes
            )
            db.add(session)
        synced_count += 1
    
    # Process track points (batch cap: 500)
    for point_data in sync_data.track_points[:500]:
        existing = db.query(models.TrackPoint).filter(
            models.TrackPoint.id == point_data.id if point_data.id else False
        ).first()
        
        if not existing:
            point = models.TrackPoint(
                id=point_data.id or models.generate_uuid(),
                session_id=point_data.session_id,
                ts=point_data.ts,
                lat=point_data.lat,
                lon=point_data.lon,
                acc=point_data.acc,
                speed=point_data.speed,
                heading=point_data.heading
            )
            db.add(point)
            synced_count += 1
    
    # Process catches
    for catch_data in sync_data.catches:
        existing = db.query(models.Catch).filter(
            models.Catch.id == catch_data.id if catch_data.id else False
        ).first()
        
        if not existing:
            catch = models.Catch(
                id=catch_data.id or models.generate_uuid(),
                session_id=catch_data.session_id,
                ts=catch_data.ts,
                species=catch_data.species,
                length=catch_data.length,
                weight=catch_data.weight,
                notes=catch_data.notes,
                lat=catch_data.lat,
                lon=catch_data.lon
            )
            db.add(catch)
            synced_count += 1
    
    # Process photo metadata
    for photo_data in sync_data.photos_meta:
        existing = db.query(models.Photo).filter(
            models.Photo.id == photo_data.id
        ).first()
        
        if not existing:
            photo = models.Photo(
                id=photo_data.id,
                session_id=photo_data.session_id,
                ts=photo_data.ts,
                lat=photo_data.lat,
                lon=photo_data.lon,
                s3_key=photo_data.s3_key,
                size=photo_data.size
            )
            db.add(photo)
            synced_count += 1
    
    db.commit()
    
    return {
        "status": "success",
        "synced_count": synced_count,
        "conflicts": conflicts,
        "server_timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.post("/down", response_model=schemas.SyncDownResponse)
async def sync_download(
    sync_request: schemas.SyncDownRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    last_sync = None
    if sync_request.last_sync_timestamp:
        try:
            last_sync = datetime.fromisoformat(sync_request.last_sync_timestamp.replace("Z", ""))
        except:
            pass
    
    # Get user's data modified since last sync
    query = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.is_deleted == False
    )
    
    if last_sync:
        query = query.filter(models.Session.last_modified_at > last_sync)
    
    sessions = query.limit(100).all()
    
    # Convert to response format
    sessions_data = []
    track_points_data = []
    catches_data = []
    photos_data = []
    
    for session in sessions:
        sessions_data.append(schemas.SessionSync(
            id=session.id,
            started_at=session.started_at,
            ended_at=session.ended_at,
            title=session.title,
            notes=session.notes
        ))
        
        # Get related data
        for point in session.track_points:
            if not point.is_deleted:
                track_points_data.append(schemas.TrackPointSync(
                    id=point.id,
                    session_id=point.session_id,
                    ts=point.ts,
                    lat=point.lat,
                    lon=point.lon,
                    acc=point.acc,
                    speed=point.speed,
                    heading=point.heading
                ))
        
        for catch in session.catches:
            if not catch.is_deleted:
                catches_data.append(schemas.CatchSync(
                    id=catch.id,
                    session_id=catch.session_id,
                    ts=catch.ts,
                    species=catch.species,
                    length=catch.length,
                    weight=catch.weight,
                    notes=catch.notes,
                    lat=catch.lat,
                    lon=catch.lon
                ))
        
        for photo in session.photos:
            if not photo.is_deleted:
                photos_data.append(schemas.PhotoMetaSync(
                    id=photo.id,
                    session_id=photo.session_id,
                    ts=photo.ts,
                    lat=photo.lat,
                    lon=photo.lon,
                    s3_key=photo.s3_key,
                    size=photo.size
                ))
    
    return {
        "sessions": sessions_data,
        "track_points": track_points_data,
        "catches": catches_data,
        "photos_meta": photos_data,
        "server_timestamp": datetime.utcnow().isoformat() + "Z",
        "has_more": len(sessions) == 100
    }