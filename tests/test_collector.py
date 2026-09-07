import pytest
from app.collector.instagram import normalize_instagram_target

def test_normalize_username():
    assert normalize_instagram_target("granny_crochet0") == "granny_crochet0"
    assert normalize_instagram_target("  granny_crochet0  ") == "granny_crochet0"

def test_normalize_full_url():
    assert normalize_instagram_target("https://www.instagram.com/granny_crochet0/") == "granny_crochet0"
    assert normalize_instagram_target("http://www.instagram.com/granny_crochet0/") == "granny_crochet0"
    assert normalize_instagram_target("https://instagram.com/granny_crochet0") == "granny_crochet0"

def test_normalize_url_with_query():
    assert normalize_instagram_target("https://www.instagram.com/granny_crochet0/?hl=en") == "granny_crochet0"

def test_normalize_malformed_url():
    with pytest.raises(ValueError, match="Malformed or non-Instagram URL provided"):
        normalize_instagram_target("https://www.facebook.com/granny_crochet0/")
        
    with pytest.raises(ValueError, match="URL points to a post or feature"):
        normalize_instagram_target("https://www.instagram.com/p/abcdefg/")

def test_normalize_invalid_username():
    with pytest.raises(ValueError, match="Invalid Instagram username format"):
        normalize_instagram_target("invalid name!")
