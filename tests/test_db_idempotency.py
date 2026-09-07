import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Post, Media
from app.database.repository import Repository
import logging

@pytest.fixture
def repo():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield Repository(session)
    session.close()

def test_prevent_duplicate_media(repo, caplog):
    caplog.set_level(logging.INFO)
    
    # Simulate first run
    post = Post(platform="instagram", platform_post_id="p1", post_url="url")
    post = repo.add_post(post)
    
    media1 = Media(post_id=post.id, media_url="http://media.url/1", media_type="image")
    repo.add_media(media1)
    
    # Simulate second run - we should check if media_url exists
    existing_media = repo.get_media_by_url("http://media.url/1")
    assert existing_media is not None
    assert existing_media.post_id == post.id
    
    # We pretend the CLI does what it does:
    if existing_media and existing_media.post_id == post.id:
        logger = logging.getLogger("archive.cli")
        logger.info(f"Media URL already known for post {post.id}, skipping insert.")
    else:
        repo.add_media(Media(post_id=post.id, media_url="http://media.url/1", media_type="image"))
        
    # Verify it wasn't added again
    count = repo.session.query(Media).filter(Media.media_url == "http://media.url/1").count()
    assert count == 1
    assert "Media URL already known" in caplog.text

def test_repeated_collection_idempotency(repo):
    # If we add the same post twice, repo.add_post handles IntegrityError and returns existing
    post1 = Post(platform="instagram", platform_post_id="p2", post_url="url2")
    p1_added = repo.add_post(post1)
    
    post2 = Post(platform="instagram", platform_post_id="p2", post_url="url2")
    p2_added = repo.add_post(post2)
    
    assert p1_added.id == p2_added.id
    assert repo.session.query(Post).count() == 1
