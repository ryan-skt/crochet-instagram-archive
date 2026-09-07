import logging
from pathlib import Path
from google import genai
from google.genai import types
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.classifier.base import BaseClassifier, ClassificationResult
from app.config import config, settings
from app.classifier.taxonomy import get_taxonomy_str

from typing import Union

logger = logging.getLogger("archive.classifier.gemini")

class GeminiClassifier(BaseClassifier):
    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model_name = config.classification.vision_model if config else "gemini-3.6-flash"
        self.taxonomy_str = get_taxonomy_str(config.taxonomy) if config else "No taxonomy provided."

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        reraise=True
    )
    def classify_image(self, image_path: Union[str, Path]) -> ClassificationResult:
        logger.debug(f"Classifying {image_path} with {self.model_name}")
        
        prompt = f"""
You are an expert AI vision classifier for a crochet media archive.
Analyze the provided image based on this specific crochet taxonomy:

{self.taxonomy_str}

Instructions:
1. Classify ONLY what is visually observable. Do not hallucinate.
2. If multiple crochet objects are in the image, list all of them in the `objects` array, but set `primary_category` and `subcategory` based on the most prominent one.
3. For `image_type`, choose from: finished_product, pattern, tutorial, close_up, lifestyle_photo, multiple_products, non_crochet.
4. Provide a confidence score between 0.0 and 1.0.
5. `construction` should describe the technique (e.g. granny square, amigurumi, tapestry).
"""

        try:
            import PIL.Image
            image = PIL.Image.open(image_path)
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[image, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ClassificationResult,
                    temperature=0.1, 
                )
            )
            
            result = ClassificationResult.model_validate_json(response.text)
            
            # Post-validation against taxonomy to prevent hallucinated categories
            if config and hasattr(config, "taxonomy"):
                valid_cats = list(config.taxonomy.keys())
                if result.primary_category not in valid_cats:
                    logger.warning(f"Hallucinated primary_category: {result.primary_category}. Forcing review.")
                    result.primary_category = "unknown"
                    result.subcategory = "unknown"
                    result.confidence = 0.0
                else:
                    valid_subcats = config.taxonomy[result.primary_category]
                    if result.subcategory not in valid_subcats:
                        logger.warning(f"Hallucinated subcategory: {result.subcategory} for {result.primary_category}. Forcing review.")
                        result.subcategory = "unknown"
                        result.confidence = 0.0

            result.model_name = self.model_name
            return result
            
        except Exception as e:
            logger.error(f"Classification failed for {image_path}: {e}")
            raise
