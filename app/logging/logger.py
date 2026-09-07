import logging
import sys
from pathlib import Path
from rich.logging import RichHandler
from app.config import config

def setup_logger():
    # Only setup if config is available
    log_file = config.project.log_file if config else "data/archive.log"
    
    # Ensure log directory exists
    Path(log_file).parent.mkdir(parents=True, exist_ok=True)
    
    logger = logging.getLogger("archive")
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        # File handler
        file_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(file_formatter)
        
        # Console handler using Rich
        console_handler = RichHandler(rich_tracebacks=True, markup=True)
        console_handler.setFormatter(logging.Formatter("%(message)s"))
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
    return logger

logger = setup_logger()
