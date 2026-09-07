import yaml
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class ProjectConfig(BaseModel):
    name: str = "crochet-instagram-archive"
    database_path: str = "data/database/archive.db"
    log_file: str = "data/archive.log"

class DirectoriesConfig(BaseModel):
    raw: str = "data/raw"
    organized: str = "data/organized"
    thumbnails: str = "data/thumbnails"
    review: str = "data/organized/_REVIEW"
    
    def create_all(self):
        for path_str in [self.raw, self.organized, self.thumbnails, self.review]:
            Path(path_str).mkdir(parents=True, exist_ok=True)

class ClassificationConfig(BaseModel):
    vision_model: str = "gemini-3.6-flash"
    confidence_threshold: float = 0.75

class AppConfig(BaseModel):
    project: ProjectConfig
    directories: DirectoriesConfig
    classification: ClassificationConfig
    taxonomy: dict[str, list[str]]

class Settings(BaseSettings):
    gemini_api_key: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

def load_config(config_path: str = "config.yaml") -> AppConfig:
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")
    
    with open(path, "r") as f:
        data = yaml.safe_load(f)
        
    return AppConfig(**data)

# Global instances
settings = Settings()
try:
    config = load_config()
except FileNotFoundError:
    config = None # Allows CLI to handle it gracefully or for tests to mock
