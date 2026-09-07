from typing import Dict, List

def get_taxonomy_str(taxonomy_dict: Dict[str, List[str]]) -> str:
    """Format the taxonomy dict into a string for the LLM prompt."""
    lines = []
    for category, subcategories in taxonomy_dict.items():
        lines.append(f"- {category}")
        for sub in subcategories:
            lines.append(f"  - {sub}")
    return "\n".join(lines)
