from abc import ABC, abstractmethod
from typing import Generator, Dict, Any, Tuple

class BaseCollector(ABC):
    
    @abstractmethod
    def collect_posts(self, target: str, limit: int = None) -> Generator[Dict[str, Any], None, None]:
        """
        Yields a dictionary containing post metadata.
        Expected format:
        {
            "platform_post_id": str,
            "post_url": str,
            "caption": str,
            "published_at": datetime,
            "media": [
                {
                    "media_url": str,
                    "media_type": str, # "image" or "video"
                    "is_video": bool,
                }
            ]
        }
        """
        pass
