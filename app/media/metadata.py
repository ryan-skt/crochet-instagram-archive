from pathlib import Path
from typing import Tuple, Optional, Union
from PIL import Image

def extract_metadata(filepath: Union[str, Path]) -> Tuple[Optional[int], Optional[int], str]:
    """
    Extract basic metadata from a file.
    Returns: (width, height, media_type)
    """
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            fmt = img.format.lower() if img.format else "image"
            return width, height, fmt
    except Exception:
        # If it fails to open as an image, we assume it's a video or other file for now
        # More robust video metadata extraction could be added here later (e.g. via ffprobe)
        return None, None, "video"
