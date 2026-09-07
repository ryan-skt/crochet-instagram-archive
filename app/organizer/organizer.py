import shutil
import logging
from pathlib import Path
import re

from app.database.repository import Repository
from app.database.models import Classification, Media
from app.config import config

logger = logging.getLogger("archive.organizer")

class Organizer:
    def __init__(self, repo: Repository):
        self.repo = repo
        self.organized_dir = Path(config.directories.organized) if config else Path("data/organized")
        self.review_dir = Path(config.directories.review) if config else Path("data/organized/_REVIEW")
        self.confidence_threshold = config.classification.confidence_threshold if config else 0.75
        
        self.organized_dir.mkdir(parents=True, exist_ok=True)
        self.review_dir.mkdir(parents=True, exist_ok=True)

    def clean_filename_component(self, text: str) -> str:
        """Remove invalid filesystem characters."""
        if not text:
            return "unknown"
        # Keep alphanumeric and underscores
        cleaned = re.sub(r'[^a-zA-Z0-9_]', '_', text.lower())
        # Replace multiple underscores with a single one
        return re.sub(r'_+', '_', cleaned).strip('_')

    def generate_filename(self, classification: Classification, media: Media) -> str:
        """
        Generate deterministic filenames.
        Example: bags__tote_bags__granny_square__000421.jpg
        """
        cat = self.clean_filename_component(classification.primary_category)
        subcat = self.clean_filename_component(classification.subcategory)
        style = self.clean_filename_component(classification.pattern_style) if classification.pattern_style else "none"
        ext = Path(media.local_path).suffix if media.local_path else ".jpg"
        
        # ID is padded
        media_id_str = f"{media.id:06d}"
        
        filename = f"{cat}__{subcat}__{style}__{media_id_str}{ext}"
        return filename

    def get_collision_safe_path(self, dest_dir: Path, filename: str) -> Path:
        """Returns a path that doesn't exist, appending _1, _2 if needed."""
        dest_path = dest_dir / filename
        counter = 1
        stem = dest_path.stem
        suffix = dest_path.suffix
        while dest_path.exists():
            dest_path = dest_dir / f"{stem}_{counter}{suffix}"
            counter += 1
        return dest_path

    def organize_media(self, media: Media, classification: Classification, dry_run: bool = False) -> bool:
        """Move/copy file to the appropriate organized folder based on classification."""
        if not media.local_path or not Path(media.local_path).exists():
            logger.error(f"Cannot organize media {media.id}: local file missing at {media.local_path}")
            return False

        source_path = Path(media.local_path)
        new_filename = self.generate_filename(classification, media)

        if classification.confidence < self.confidence_threshold:
            # Send to review
            dest_dir = self.review_dir
            if not dry_run:
                logger.info(f"Media {media.id} confidence {classification.confidence} < {self.confidence_threshold}. Routing to _REVIEW.")
        else:
            # Send to organized folder by category/subcategory
            cat_dir = self.clean_filename_component(classification.primary_category)
            subcat_dir = self.clean_filename_component(classification.subcategory)
            dest_dir = self.organized_dir / cat_dir / subcat_dir
            if not dry_run:
                dest_dir.mkdir(parents=True, exist_ok=True)

        # Get collision safe path, but only if it's not a dry run since we might just be logging
        if not dry_run:
            dest_path = self.get_collision_safe_path(dest_dir, new_filename)
        else:
            dest_path = dest_dir / new_filename
        
        if dry_run:
            print(f"[DRY RUN] Would copy {source_path} -> {dest_path}")
            return True

        try:
            shutil.copy2(source_path, dest_path)
            logger.info(f"Organized media {media.id} -> {dest_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to organize media {media.id}: {e}")
            return False

    def run_organization(self, dry_run: bool = False):
        """Finds all media with a classification and organizes them if not already in the target folder."""
        classifications = self.repo.session.query(Classification).all()
        for c in classifications:
            # Re-fetch media
            media = c.media
            if media and media.download_status == "success":
                # Check if it already exists by exactly this filename
                # If it exists, we assume it's already organized. 
                # (A true collision is when two DIFFERENT media try to get the same filename,
                # but our filename includes media_id, so a collision is rare but possible if DB was reset).
                dest_filename = self.generate_filename(c, media)
                cat_dir = self.clean_filename_component(c.primary_category)
                subcat_dir = self.clean_filename_component(c.subcategory)
                
                if c.confidence < self.confidence_threshold:
                    dest_path = self.review_dir / dest_filename
                else:
                    dest_path = self.organized_dir / cat_dir / subcat_dir / dest_filename
                    
                if not dest_path.exists() or dry_run:
                    self.organize_media(media, c, dry_run=dry_run)
