import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.classifier.base import ClassificationResult
from app.classifier.vision import GeminiClassifier

def test_classification_result_validation():
    # Valid data
    result = ClassificationResult(
        primary_category="bags",
        subcategory="tote_bags",
        product_type="bag",
        construction="granny square",
        image_type="finished_product",
        pattern_style="classic",
        description="A beautiful bag",
        confidence=0.9
    )
    assert result.primary_category == "bags"
    assert result.confidence == 0.9

    # Invalid confidence
    with pytest.raises(ValueError):
        ClassificationResult(
            primary_category="bags",
            subcategory="tote_bags",
            product_type="bag",
            construction="granny square",
            image_type="finished_product",
            pattern_style="classic",
            description="A beautiful bag",
            confidence=1.5 # Should fail
        )

@patch("app.classifier.vision.genai.Client")
@patch("app.classifier.vision.settings")
def test_gemini_classifier_mock(mock_settings, mock_client_class, tmp_path):
    mock_settings.gemini_api_key = "test_key"
    
    mock_client = MagicMock()
    mock_client_class.return_value = mock_client
    
    # Setup mock response
    mock_response = MagicMock()
    mock_response.text = '''{
        "primary_category": "bags",
        "subcategory": "tote_bags",
        "product_type": "bag",
        "construction": "granny square",
        "image_type": "finished_product",
        "colors": ["red", "blue"],
        "pattern_style": "classic",
        "objects": ["tote bag"],
        "description": "A beautiful bag",
        "tags": ["crochet"],
        "confidence": 0.95
    }'''
    mock_client.models.generate_content.return_value = mock_response
    
    classifier = GeminiClassifier()
    
    # Create dummy image
    from PIL import Image
    img_path = tmp_path / "test.jpg"
    img = Image.new('RGB', (10, 10))
    img.save(img_path)
    
    result = classifier.classify_image(img_path)
    
    assert result.primary_category == "bags"
    assert result.confidence == 0.95
    assert result.objects == ["tote bag"]
    assert mock_client.models.generate_content.called

@patch("app.classifier.vision.genai.Client")
@patch("app.classifier.vision.settings")
def test_gemini_classifier_hallucination(mock_settings, mock_client_class, tmp_path):
    mock_settings.gemini_api_key = "test_key"
    mock_client = MagicMock()
    mock_client_class.return_value = mock_client
    
    # Setup mock response with hallucinated category
    mock_response = MagicMock()
    mock_response.text = '''{
        "primary_category": "weapons",
        "subcategory": "swords",
        "product_type": "sword",
        "construction": "metal",
        "image_type": "finished_product",
        "pattern_style": "sharp",
        "description": "A sharp sword",
        "confidence": 0.99
    }'''
    mock_client.models.generate_content.return_value = mock_response
    
    classifier = GeminiClassifier()
    img_path = tmp_path / "test.jpg"
    from PIL import Image
    Image.new('RGB', (10, 10)).save(img_path)
    
    result = classifier.classify_image(img_path)
    
    # Should be forced to unknown and 0.0 confidence
    assert result.primary_category == "unknown"
    assert result.subcategory == "unknown"
    assert result.confidence == 0.0
