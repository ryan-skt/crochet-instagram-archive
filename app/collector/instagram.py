import logging
import re
from typing import Generator, Dict, Any
from datetime import datetime
import instaloader
from app.collector.base import BaseCollector

logger = logging.getLogger("archive.collector.instagram")

def normalize_instagram_target(target: str) -> str:
    """
    Normalizes an Instagram profile URL or username into just the username.
    Validates that the URL belongs to Instagram if provided as a URL.
    """
    target = target.strip()
    
    # If it looks like a URL
    if target.startswith("http://") or target.startswith("https://"):
        # Match standard instagram profile URLs
        match = re.match(r'^https?://(?:www\.)?instagram\.com/([^/?#]+).*$', target, re.IGNORECASE)
        if not match:
            raise ValueError(f"Malformed or non-Instagram URL provided: {target}")
        username = match.group(1)
        if username in ('p', 'reel', 'reels', 'tv', 'explore', 'stories'):
            raise ValueError(f"URL points to a post or feature, not a profile: {target}")
        return username
    
    # Assume it's a raw username, just do basic validation
    if not re.match(r'^[a-zA-Z0-9._]+$', target):
        raise ValueError(f"Invalid Instagram username format: {target}")
        
    return target

class InstaloaderCollector(BaseCollector):
    def __init__(self):
        # Anonymous Instaloader is kept isolated, but marked unsupported.
        self.L = instaloader.Instaloader(
            download_pictures=False,
            download_videos=False,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
            post_metadata_txt_pattern=""
        )

    def collect_posts(self, target: str, limit: int = None) -> Generator[Dict[str, Any], None, None]:
        logger.error("Instagram automatic acquisition is currently unavailable without an authorized acquisition method.")
        raise RuntimeError("Instagram automatic acquisition is currently unavailable without an authorized acquisition method.")
        yield
