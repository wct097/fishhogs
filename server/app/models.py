from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    started_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime)
    title = Column(String)
    notes = Column(Text)
    last_modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="sessions")
    track_points = relationship("TrackPoint", back_populates="session")
    photos = relationship("Photo", back_populates="session")
    catches = relationship("Catch", back_populates="session")

class TrackPoint(Base):
    __tablename__ = "track_points"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id"))
    ts = Column(Integer, nullable=False)  # Unix timestamp
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    acc = Column(Float)  # Accuracy
    speed = Column(Float)
    heading = Column(Float)
    last_modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    session = relationship("Session", back_populates="track_points")

class Photo(Base):
    __tablename__ = "photos"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id"))
    ts = Column(Integer, nullable=False)
    lat = Column(Float)
    lon = Column(Float)
    uri = Column(String)  # Local URI
    s3_key = Column(String)  # Remote storage key
    size = Column(Integer)
    last_modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    session = relationship("Session", back_populates="photos")

class Catch(Base):
    __tablename__ = "catches"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id"))
    ts = Column(Integer, nullable=False)
    species = Column(String, nullable=False)
    length = Column(Float)
    weight = Column(Float)
    notes = Column(Text)
    lat = Column(Float)
    lon = Column(Float)
    last_modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    session = relationship("Session", back_populates="catches")