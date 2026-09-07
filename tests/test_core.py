import pytest
import os
from pathlib import Path
from PIL import Image
from sqlalchemy import create_engine
from app.database.models import Base, Media, Post, Classification
from app.database.repository import Repository
from app.media.hashing import get_sha256, get_phash
from app.media.validation import is_valid_image

@pytest.fixture
def repo():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield Repository(session)
    session.close()

def test_database_crud(repo):
    post = Post(platform="instagram", platform_post_id="123", post_url="url")
    repo.add_post(post)
    
    media = Media(post_id=post.id, media_url="url", media_type="image")
    repo.add_media(media)
    
    assert repo.get_post_by_platform_id("123") is not None
    assert len(repo.get_pending_media()) == 1

def test_hashing_and_validation(tmp_path):
    img_path = tmp_path / "test.jpg"
    img = Image.new('RGB', (60, 30), color = 'red')
    img.save(img_path)
    
    assert is_valid_image(img_path) == True
    sha = get_sha256(img_path)
    assert len(sha) == 64
    ph = get_phash(img_path)
    assert ph is not None

def test_corrupted_image(tmp_path):
    bad_path = tmp_path / "bad.jpg"
    bad_path.write_bytes(b"not an image file")
    
    assert is_valid_image(bad_path) == False
    assert get_phash(bad_path) is None

def test_organizer_filename(repo):
    from app.organizer.organizer import Organizer
    org = Organizer(repo)
    c = Classification(primary_category="Bags", subcategory="Tote bags!", pattern_style="Granny_Square", image_type="finished_product", confidence=1.0, model="test")
    m = Media(id=42, local_path="test.jpg")
    
    name = org.generate_filename(c, m)
    assert name == "bags__tote_bags__granny_square__000042.jpg"

def test_organizer_dry_run_and_structure(repo, tmp_path):
    from app.organizer.organizer import Organizer
    from app.database.models import Post
    org = Organizer(repo)
    org.organized_dir = tmp_path / "organized"
    org.review_dir = tmp_path / "review"
    org.review_dir.mkdir(parents=True, exist_ok=True)
    org.organized_dir.mkdir(parents=True, exist_ok=True)
    
    # Setup test file
    raw_dir = tmp_path / "raw"
    raw_dir.mkdir()
    test_img = raw_dir / "test.jpg"
    test_img.write_text("data")
    
    # Needs a post for foreign key constraint
    p = Post(platform_post_id="post1", post_url="http", platform="test")
    p2 = Post(platform_post_id="post2", post_url="http2", platform="test")
    repo.session.add(p)
    repo.session.add(p2)
    
    c = Classification(
        primary_category="Bags", 
        subcategory="Tote bags", 
        pattern_style="striped",
        image_type="finished_product",
        confidence=0.9,
        model="test"
    )
    m = Media(id=1, post_id="post1", local_path=str(test_img), media_url="test", media_type="image", download_status="success")
    repo.session.add(c)
    repo.session.add(m)
    c.media = m
    repo.session.commit()
    
    # 1. Test Dry Run
    result = org.organize_media(m, c, dry_run=True)
    assert result is True
    # Verify no files were copied
    assert not (tmp_path / "organized").exists() or not list((tmp_path / "organized").rglob("*.jpg"))
    
    # 2. Test Real Run & Subcategory Structure
    result = org.organize_media(m, c, dry_run=False)
    assert result is True
    expected_path = org.organized_dir / "bags" / "tote_bags" / "bags__tote_bags__striped__000001.jpg"
    assert expected_path.exists()
    
    # 3. Test Low Confidence
    c2 = Classification(
        primary_category="Bags", 
        subcategory="Tote bags", 
        pattern_style="striped",
        image_type="finished_product",
        confidence=0.5, # low
        model="test"
    )
    m2 = Media(id=2, post_id="post2", local_path=str(test_img), media_url="test2", media_type="image", download_status="success")
    repo.session.add(c2)
    repo.session.add(m2)
    c2.media = m2
    repo.session.commit()
    
    result = org.organize_media(m2, c2, dry_run=False)
    expected_review_path = org.review_dir / "bags__tote_bags__striped__000002.jpg"
    assert expected_review_path.exists()
    
    # 4. Test Collision
    # If we try to organize m2 again into the same folder, it shouldn't overwrite, but since it's exact same name run_organization skips it.
    # What if we force it to organize by calling organize_media directly?
    result = org.organize_media(m2, c2, dry_run=False)
    assert result is True
    # Should create a _1 file
    expected_collision_path = org.review_dir / "bags__tote_bags__striped__000002_1.jpg"
    assert expected_collision_path.exists()
