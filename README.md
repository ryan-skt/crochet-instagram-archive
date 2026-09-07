# Crochet Instagram Archive

A production-quality local media archiving system, explicitly designed to archive crochet images, classify them using AI, and organize them locally.

## Features
- **Phase 1: Collection**: Safely import legitimately acquired local folders of images into a SQLite database and `data/raw/` directory. *(Note: Instagram automatic acquisition is currently unavailable without an authorized acquisition method).*
- **Phase 2: AI Classification**: Classifies images using Google Gemini Vision (gemini-3.6-flash), saving structured metadata.
- **Phase 3: Organization**: Automatically organizes files into categorized destination folders based on taxonomy.
- **Deduplication**: SHA-256 for exact match and pHash for visual similarities.
- **Human Review**: Low confidence classifications (< 0.75) are routed to a `_REVIEW` folder for manual approval via CLI.

## Requirements
- Python 3.9+

## Setup
1. Clone this repository.
2. Create a virtual environment and activate it:
   `python -m venv venv && source venv/bin/activate`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`.
5. *(Optional)* Modify `config.yaml` to adjust directories, taxonomy, or AI thresholds.

## Usage

### Phase 1: Local Import
Import a folder of images you have already acquired:
```bash
python -m app.cli import-folder /path/to/your/images
```

### Phase 2: Classification
```bash
# Send raw images to Gemini for classification
python -m app.cli classify
```

### Phase 3: Organization
```bash
# Organize files based on classification
python -m app.cli organize
```

### Management
```bash
# Run the test suite
pytest tests/

# Check status
python -m app.cli status

# Review low confidence items
python -m app.cli review

# Find visual duplicates
python -m app.cli duplicates
```
