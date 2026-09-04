import os
from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from apps.api.config import settings
from services.camera_registry.models import Base

# Sync database setup for reliable execution across environments
sync_db_url = settings.SYNC_DATABASE_URL
# If running locally with default sqlite or postgres
if "sqlite" in sync_db_url:
    engine = create_engine(
        sync_db_url,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        sync_db_url,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency for FastAPI endpoints providing a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """Context manager for standalone scripts or background workers."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
