import pytest
from pathlib import Path
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Media, Post
from app.database.repository import Repository
from app.collector.local import LocalImporter

@pytest.fixture
def repo():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield Repository(session)
    session.close()

def create_dummy_image(path: Path):
    img = Image.new('RGB', (10, 10), color='blue')
    img.save(path)

def test_local_import(repo, tmp_path):
    # Setup test folder
    import_dir = tmp_path / "import"
    import_dir.mkdir()
    
    img1 = import_dir / "test1.jpg"
    img2 = import_dir / "test2.png"
    txt = import_dir / "ignore.txt"
    
    create_dummy_image(img1)
    create_dummy_image(img2)
    txt.write_text("not an image")
    
    importer = LocalImporter(repo)
    importer.raw_dir = tmp_path / "raw"
    importer.raw_dir.mkdir()
    
    # Run import
    importer.import_folder(import_dir)
    
    # Assertions
    posts = repo.session.query(Post).all()
    assert len(posts) == 1
    assert posts[0].platform == "local"
    
    media = repo.session.query(Media).all()
    assert len(media) == 2
    
    # Check if raw files were created
    raw_files = list(importer.raw_dir.glob("*"))
    assert len(raw_files) == 2
    
    # Test dry run
    img3 = import_dir / "test3.jpg"
    create_dummy_image(img3)
    
    importer.import_folder(import_dir, dry_run=True)
    assert repo.session.query(Media).count() == 2 # Should not increase
    
def test_local_import_duplicate_detection(repo, tmp_path):
    import_dir = tmp_path / "import"
    import_dir.mkdir()
    
    # Same content for two images (will have same SHA256)
    img1 = import_dir / "test1.jpg"
    img2 = import_dir / "test2.jpg"
    create_dummy_image(img1)
    
    # We copy so it's identically hashed
    import shutil
    shutil.copy2(img1, img2)
    
    importer = LocalImporter(repo)
    importer.raw_dir = tmp_path / "raw"
    importer.raw_dir.mkdir()
    
    importer.import_folder(import_dir)
    
    # Should only import 1 media because of SHA256 dupe check
    media = repo.session.query(Media).all()
    assert len(media) == 1
