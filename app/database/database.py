import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
from app.config import config
from app.database.models import Base

def get_engine():
    db_path = config.project.database_path if config else "data/database/archive.db"
    
    # Ensure directory exists
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    
    # SQLite URL
    db_url = f"sqlite:///{db_path}"
    
    engine = create_engine(
        db_url,
        echo=False,
        connect_args={"check_same_thread": False} # Needed for SQLite in multithreaded (if any)
    )
    return engine

def init_db(engine=None):
    if engine is None:
        engine = get_engine()
    Base.metadata.create_all(bind=engine)

def get_session(engine=None):
    if engine is None:
        engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()
