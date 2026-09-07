from pathlib import Path
from PIL import Image

from typing import Union
def is_valid_image(filepath: Union[str, Path]) -> bool:
    """Check if the file is a valid, uncorrupted image."""
    try:
        with Image.open(filepath) as img:
            img.verify()
        return True
    except Exception:
        return False
