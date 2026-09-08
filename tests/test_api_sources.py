import pytest
from fastapi.testclient import TestClient
from app.api import app, normalize_instagram_source
from app.database.models import Base
from app.database.database import get_session
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test DB
@pytest.fixture(scope="function")
def test_db():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    engine = create_engine(f"sqlite:///{path}")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = TestingSessionLocal()
    
    # Override dependency
    from app.api import get_db
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    
    yield db
    
    # Teardown
    db.close()
    os.remove(path)

@pytest.fixture(scope="function")
def client(test_db):
    return TestClient(app)

def test_normalize_instagram_source():
    # Username only
    u, url = normalize_instagram_source("granny_crochet0")
    assert u == "granny_crochet0"
    assert url == "https://www.instagram.com/granny_crochet0/"
    
    # @ username
    u, url = normalize_instagram_source("@granny_crochet0")
    assert u == "granny_crochet0"
    assert url == "https://www.instagram.com/granny_crochet0/"
    
    # Full URL
    u, url = normalize_instagram_source("https://www.instagram.com/granny_crochet0/")
    assert u == "granny_crochet0"
    assert url == "https://www.instagram.com/granny_crochet0/"
    
    # Mobile URL
    u, url = normalize_instagram_source("https://instagram.com/granny_crochet0")
    assert u == "granny_crochet0"
    assert url == "https://www.instagram.com/granny_crochet0/"

def test_create_and_list_source(client):
    response = client.post("/api/sources", json={
        "type": "instagram",
        "username": "test_user"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "instagram"
    assert data["username"] == "test_user"
    assert data["url"] == "https://www.instagram.com/test_user/"
    assert data["status"] == "ready"
    
    # List
    response = client.get("/api/sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) == 1
    assert sources[0]["username"] == "test_user"
    
    # Get by ID
    source_id = sources[0]["id"]
    response = client.get(f"/api/sources/{source_id}")
    assert response.status_code == 200
    assert response.json()["username"] == "test_user"

def test_invalid_source_input(client):
    # Missing username/url for instagram
    response = client.post("/api/sources", json={
        "type": "instagram"
    })
    assert response.status_code == 400
    
    # Invalid type
    response = client.post("/api/sources", json={
        "type": "twitter",
        "username": "test"
    })
    assert response.status_code == 400

def test_attempting_acquisition(client):
    response = client.post("/api/sources", json={
        "type": "instagram",
        "username": "test_user"
    })
    source_id = response.json()["id"]
    
    response = client.post(f"/api/sources/{source_id}/run")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unavailable"
    assert "authorized acquisition method" in data["message"]
    
    # Verify status updated in DB
    source = client.get(f"/api/sources/{source_id}").json()
    assert source["status"] == "unavailable"
    assert "authorized acquisition method" in source["error_message"]

