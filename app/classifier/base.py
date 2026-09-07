from abc import ABC, abstractmethod
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Union

class ClassificationResult(BaseModel):
    primary_category: str
    subcategory: str
    product_type: str
    construction: str
    image_type: str
    colors: List[str] = Field(default_factory=list)
    pattern_style: str
    objects: List[str] = Field(default_factory=list)
    description: str
    tags: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    model_name: Optional[str] = None

class BaseClassifier(ABC):
    @abstractmethod
    def classify_image(self, image_path: Union[str, Path]) -> ClassificationResult:
        """Analyze an image and return structured classification data."""
        pass
