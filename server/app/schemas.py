from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenRefresh(BaseModel):
    refresh_token: str

class PasswordReset(BaseModel):
    email: EmailStr

# Sync schemas
class TrackPointSync(BaseModel):
    id: Optional[str] = None
    session_id: str
    ts: int
    lat: float
    lon: float
    acc: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None

class PhotoMetaSync(BaseModel):
    id: str
    session_id: str
    ts: int
    lat: Optional[float] = None
    lon: Optional[float] = None
    s3_key: Optional[str] = None
    size: Optional[int] = None

class CatchSync(BaseModel):
    id: Optional[str] = None
    session_id: str
    ts: int
    species: str
    length: Optional[float] = None
    weight: Optional[float] = None
    notes: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class SessionSync(BaseModel):
    id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    title: Optional[str] = None
    notes: Optional[str] = None

class SyncUpRequest(BaseModel):
    last_sync_timestamp: Optional[str] = None
    sessions: List[SessionSync] = []
    track_points: List[TrackPointSync] = []
    catches: List[CatchSync] = []
    photos_meta: List[PhotoMetaSync] = []

class SyncUpResponse(BaseModel):
    status: str
    synced_count: int
    conflicts: List[dict] = []
    server_timestamp: str

class SyncDownRequest(BaseModel):
    last_sync_timestamp: Optional[str] = None

class SyncDownResponse(BaseModel):
    sessions: List[SessionSync] = []
    track_points: List[TrackPointSync] = []
    catches: List[CatchSync] = []
    photos_meta: List[PhotoMetaSync] = []
    server_timestamp: str
    has_more: bool = False

# Photo schemas
class PresignedUrlRequest(BaseModel):
    filename: str
    content_type: str

class PresignedUrlResponse(BaseModel):
    upload_url: str
    photo_id: str
    expires_in: int