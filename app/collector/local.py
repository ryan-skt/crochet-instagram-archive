import logging
import shutil
import time
from pathlib import Path
from typing import Generator, Dict, Any, Union
from datetime import datetime

from app.database.repository import Repository
from app.database.models import Post, Media
from app.media.hashing import compute_all_hashes
from app.media.validation import is_valid_image
from app.media.metadata import extract_metadata
from app.config import config

logger = logging.getLogger("archive.importer")

class LocalImporter:
    def __init__(self, repo: Repository):
        self.repo = repo
        self.raw_dir = Path(config.directories.raw) if config else Path("data/raw")
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.supported_extensions = {".jpg", ".jpeg", ".png", ".webp"}

    def import_folder(self, folder_path: Union[str, Path], dry_run: bool = False):
        folder_path = Path(folder_path)
        if not folder_path.exists() or not folder_path.is_dir():
            logger.error(f"Invalid folder path: {folder_path}")
            return

        logger.info(f"Scanning folder {folder_path} for supported images...")
        
        # Create a single Post record to act as a container for this import batch
        batch_id = f"local_import_{int(time.time())}"
        post = Post(
            platform="local",
            platform_post_id=batch_id,
            post_url=str(folder_path.absolute()),
            caption=f"Local import from {folder_path.name}"
        )
        
        if not dry_run:
            post = self.repo.add_post(post)
            logger.info(f"Created local import batch record: {batch_id}")

        imported_count = 0
        skipped_count = 0
        failed_count = 0

        for filepath in folder_path.rglob("*"):
            if not filepath.is_file():
                continue
                
            if filepath.suffix.lower() not in self.supported_extensions:
                continue
                
            logger.debug(f"Processing {filepath.name}...")
            
            # Check validation
            if not is_valid_image(filepath):
                logger.warning(f"File {filepath.name} is not a valid image. Skipping.")
                failed_count += 1
                continue

            # Calculate hashes
            sha256, phash, dhash = compute_all_hashes(filepath)
            
            # Check for duplicates
            existing = self.repo.get_media_by_hash(sha256)
            if existing:
                logger.info(f"Duplicate found (SHA256) for {filepath.name}. Skipping.")
                skipped_count += 1
                continue

            if dry_run:
                logger.info(f"[DRY RUN] Would import: {filepath.name}")
                imported_count += 1
                continue

            # Copy file to raw/
            width, height, ext = extract_metadata(filepath)
            ext = ext if ext != "image" else filepath.suffix.lstrip('.')
            
            # Use original filename in the new name to preserve it, but ensure uniqueness
            safe_original_name = filepath.stem.replace(" ", "_")
            final_filename = f"local_{safe_original_name}_{sha256[:8]}.{ext}"
            final_path = self.raw_dir / final_filename
            
            # Copy while preserving metadata
            try:
                shutil.copy2(filepath, final_path)
            except Exception as e:
                logger.error(f"Failed to copy {filepath}: {e}")
                failed_count += 1
                continue

            # Create media record
            media = Media(
                post_id=post.id,
                media_url=f"file://{filepath.absolute()}",
                local_path=str(final_path),
                filename=final_filename,
                media_type="image",
                width=width,
                height=height,
                sha256=sha256,
                phash=phash,
                downloaded_at=datetime.utcnow(),
                download_status="success"
            )
            self.repo.add_media(media)
            logger.info(f"Imported: {final_filename}")
            imported_count += 1

        logger.info(f"Import complete. Imported: {imported_count}, Skipped: {skipped_count}, Failed: {failed_count}")
