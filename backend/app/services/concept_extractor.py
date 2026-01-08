"""
Concept extraction utilities.

Given raw text, derive concept-level chunks with titles and summaries.
"""
from typing import List, Dict, Any
from .pdf_parser import normalize_text, split_into_sections


def extract_concepts(text: str) -> List[Dict[str, Any]]:
    """Return a list of concept dicts: {title, content, summary}."""
    clean = normalize_text(text)
    sections = split_into_sections(clean)
    concepts: List[Dict[str, Any]] = []
    for title, content in sections:
        summary = summarize(content)
        concepts.append({"title": title, "content": content, "summary": summary})
    return concepts


def summarize(text: str, max_len: int = 240) -> str:
    """Very simple extractive summary: take the first sentences until max_len."""
    import re
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    out: List[str] = []
    total = 0
    for s in sentences:
        if not s:
            continue
        if total + len(s) > max_len:
            break
        out.append(s)
        total += len(s)
    return " ".join(out) or text[:max_len]
