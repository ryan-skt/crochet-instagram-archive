from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import re

from app.database.database import get_session
from app.database.repository import Repository
from app.database.models import Source

app = FastAPI(title="Crochet Image Archive API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = get_session()
    try:
        yield db
    finally:
        db.close()

def get_repo(db = Depends(get_db)):
    return Repository(db)

class SourceCreate(BaseModel):
    type: str
    username: Optional[str] = None
    url: Optional[str] = None

class SourceResponse(BaseModel):
    id: int
    type: str
    username: Optional[str]
    url: Optional[str]
    status: str
    created_at: datetime
    last_run_at: Optional[datetime]
    media_count: int
    error_message: Optional[str]

    class Config:
        from_attributes = True

def normalize_instagram_source(source_input: str):
    # Matches https://instagram.com/user, @user, user
    source_input = source_input.strip()
    username = None
    url = None

    if "instagram.com" in source_input:
        # Extract username from url
        match = re.search(r'instagram\.com/([^/?#]+)', source_input)
        if match:
            username = match.group(1)
        url = source_input if source_input.startswith("http") else f"https://{source_input}"
        if not url.startswith("https://www.instagram.com"):
            url = f"https://www.instagram.com/{username}/" if username else url
    else:
        username = source_input.lstrip('@')
        url = f"https://www.instagram.com/{username}/"
        
    return username, url

@app.get("/api/sources", response_model=List[SourceResponse])
def list_sources(repo: Repository = Depends(get_repo)):
    return repo.get_sources()

@app.post("/api/sources", response_model=SourceResponse)
def add_source(source_in: SourceCreate, repo: Repository = Depends(get_repo)):
    if source_in.type == "instagram":
        input_val = source_in.url or source_in.username
        if not input_val:
            raise HTTPException(status_code=400, detail="Must provide url or username for Instagram source")
        
        username, url = normalize_instagram_source(input_val)
        
        if not username:
            raise HTTPException(status_code=400, detail="Invalid Instagram URL or username")
            
        source = Source(
            type="instagram",
            username=username,
            url=url,
            status="ready"
        )
        return repo.add_source(source)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported source type: {source_in.type}")

@app.get("/api/sources/{source_id}", response_model=SourceResponse)
def get_source(source_id: int, repo: Repository = Depends(get_repo)):
    source = repo.get_source_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source

class RunResponse(BaseModel):
    status: str
    message: str

@app.post("/api/sources/{source_id}/run", response_model=RunResponse)
def run_source(source_id: int, repo: Repository = Depends(get_repo)):
    source = repo.get_source_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    if source.type == "instagram":
        # Future-proof adapter interaction
        # We explicitly return unavailable
        source.status = "unavailable"
        source.error_message = "Instagram automatic acquisition is currently unavailable without an authorized acquisition method."
        repo.update_source(source)
        
        return RunResponse(
            status="unavailable",
            message=source.error_message
        )
    else:
        raise HTTPException(status_code=400, detail=f"Acquisition for type {source.type} not implemented in API")
