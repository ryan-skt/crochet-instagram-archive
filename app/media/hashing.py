import hashlib
from PIL import Image
import imagehash
from pathlib import Path
from typing import Optional, Tuple, Union

def get_sha256(filepath: Union[str, Path]) -> str:
    """Calculate the SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def get_phash(filepath: Union[str, Path]) -> Optional[str]:
    """Calculate the perceptual hash (pHash) of an image."""
    try:
        with Image.open(filepath) as img:
            return str(imagehash.phash(img))
    except Exception:
        # Not an image or corrupted
        return None

def get_dhash(filepath: Union[str, Path]) -> Optional[str]:
    """Calculate the difference hash (dHash) of an image."""
    try:
        with Image.open(filepath) as img:
            return str(imagehash.dhash(img))
    except Exception:
        return None

def compute_all_hashes(filepath: Union[str, Path]) -> Tuple[str, Optional[str], Optional[str]]:
    """Return (sha256, phash, dhash)."""
    return get_sha256(filepath), get_phash(filepath), get_dhash(filepath)
