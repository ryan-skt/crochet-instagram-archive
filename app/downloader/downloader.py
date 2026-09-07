import httpx
import logging
import time
from pathlib import Path
from typing import Optional
from datetime import datetime

from app.database.models import Media
from app.database.repository import Repository
from app.config import config
from app.media.hashing import compute_all_hashes
from app.media.validation import is_valid_image
from app.media.metadata import extract_metadata

logger = logging.getLogger("archive.downloader")

class Downloader:
    def __init__(self, repo: Repository):
        self.repo = repo
        self.raw_dir = Path(config.directories.raw) if config else Path("data/raw")
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.client = httpx.Client(timeout=30.0)

    def download_media(self, media_db: Media) -> bool:
        """Download media, hash it, check for dupes, and save."""
        if media_db.download_status == "success":
            return True

        if not media_db.media_url:
            logger.error(f"Media {media_db.id} has no URL.")
            return False

        # Temporary download path
        temp_filename = f"temp_{media_db.id}_{int(time.time())}.tmp"
        temp_path = self.raw_dir / temp_filename

        try:
            # Download with basic retries
            for attempt in range(3):
                try:
                    response = self.client.get(media_db.media_url)
                    response.raise_for_status()
                    
                    with open(temp_path, "wb") as f:
                        f.write(response.content)
                    break
                except httpx.RequestError as e:
                    logger.warning(f"Download attempt {attempt + 1} failed: {e}")
                    if attempt == 2:
                        raise
                    time.sleep(2 ** attempt) # Exponential backoff

            # Hash and extract metadata
            sha256, phash, dhash = compute_all_hashes(temp_path)
            
            # Duplicate check via DB
            existing = self.repo.get_media_by_hash(sha256)
            if existing and existing.id != media_db.id:
                logger.info(f"Exact duplicate detected (SHA256). Marking skipped. (Media ID {media_db.id} dupes {existing.id})")
                media_db.download_status = "skipped"
                self.repo.update_media(media_db)
                temp_path.unlink(missing_ok=True)
                return False
                
            # If valid image, extract metadata and check corruption
            if media_db.media_type == "image":
                if not is_valid_image(temp_path):
                    logger.error(f"Downloaded image is corrupted. Media ID {media_db.id}")
                    media_db.download_status = "failed"
                    self.repo.update_media(media_db)
                    temp_path.unlink(missing_ok=True)
                    return False
                    
            width, height, ext = extract_metadata(temp_path)
            ext = ext if ext != "image" else "jpg" # default fallback
            if media_db.media_type == "video":
                ext = "mp4" # fallback for video

            # Generate final raw filename
            final_filename = f"media_{media_db.id:06d}_{sha256[:8]}.{ext}"
            final_path = self.raw_dir / final_filename
            
            # Move temp to final
            temp_path.rename(final_path)

            # Update DB
            media_db.sha256 = sha256
            media_db.phash = phash
            media_db.width = width
            media_db.height = height
            media_db.local_path = str(final_path)
            media_db.filename = final_filename
            media_db.downloaded_at = datetime.utcnow()
            media_db.download_status = "success"
            
            self.repo.update_media(media_db)
            logger.info(f"Successfully downloaded and processed media {media_db.id}")
            return True

        except Exception as e:
            logger.error(f"Failed to download media {media_db.id}: {e}")
            media_db.download_status = "failed"
            self.repo.update_media(media_db)
            temp_path.unlink(missing_ok=True)
            return False
            
    def process_pending(self, limit: Optional[int] = None):
        pending = self.repo.get_pending_media(limit)
        logger.info(f"Found {len(pending)} pending media to download.")
        
        for p in pending:
            self.download_media(p)
