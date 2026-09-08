from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    platform: Mapped[str] = mapped_column(String(50))
    platform_post_id: Mapped[str] = mapped_column(String(255), unique=True)
    post_url: Mapped[str] = mapped_column(String(500))
    caption: Mapped[Optional[str]] = mapped_column(String)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    collected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    media = relationship("Media", back_populates="post", cascade="all, delete-orphan")

class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))
    media_url: Mapped[str] = mapped_column(String(1000))
    local_path: Mapped[Optional[str]] = mapped_column(String(500))
    filename: Mapped[Optional[str]] = mapped_column(String(255))
    media_type: Mapped[str] = mapped_column(String(50)) # e.g. "image", "video"
    width: Mapped[Optional[int]] = mapped_column(Integer)
    height: Mapped[Optional[int]] = mapped_column(Integer)
    sha256: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    phash: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    downloaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    download_status: Mapped[str] = mapped_column(String(50), default="pending") # pending, success, failed, skipped
    
    post = relationship("Post", back_populates="media")
    classification = relationship("Classification", back_populates="media", uselist=False, cascade="all, delete-orphan")

class Classification(Base):
    __tablename__ = "classifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    media_id: Mapped[int] = mapped_column(ForeignKey("media.id"), unique=True)
    primary_category: Mapped[str] = mapped_column(String(100))
    subcategory: Mapped[str] = mapped_column(String(100))
    product_type: Mapped[Optional[str]] = mapped_column(String(100))
    construction: Mapped[Optional[str]] = mapped_column(String(100))
    image_type: Mapped[str] = mapped_column(String(100))
    colors: Mapped[Optional[list[str]]] = mapped_column(JSON)
    pattern_style: Mapped[Optional[str]] = mapped_column(String(100))
    objects: Mapped[Optional[list[str]]] = mapped_column(JSON)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    tags: Mapped[Optional[list[str]]] = mapped_column(JSON)
    confidence: Mapped[float] = mapped_column(Float)
    model: Mapped[str] = mapped_column(String(100))
    classified_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    media = relationship("Media", back_populates="classification")

class Source(Base):
    __tablename__ = "sources"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(50))
    username: Mapped[Optional[str]] = mapped_column(String(255))
    url: Mapped[Optional[str]] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(50), default="ready")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    media_count: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(String)
