"""
PDF and text ingestion utilities.

Responsible for extracting raw text from PDFs and producing
topic/concept level chunks suitable for downstream processing.
"""
from typing import List, Dict, Any, Tuple

try:
    from PyPDF2 import PdfReader  # lightweight PDF text extraction
except Exception:  # optional dependency
    PdfReader = None  # type: ignore


def extract_text_from_pdf_bytes(data: bytes) -> str:
    """Extract plain text from a PDF given its bytes.

    Returns empty string if PyPDF2 is unavailable or parsing fails.
    """
    if PdfReader is None:
        return ""
    try:
        import io
        reader = PdfReader(io.BytesIO(data))
        parts: List[str] = []
        for page in reader.pages:
            txt = page.extract_text() or ""
            parts.append(txt)
        return "\n".join(parts)
    except Exception:
        return ""


def normalize_text(text: str) -> str:
    """Basic cleanup: collapse whitespace and strip."""
    return "\n".join(line.strip() for line in text.splitlines()).strip()


def split_into_sections(text: str) -> List[Tuple[str, str]]:
    """Heuristic split by likely headings.

    - Detect lines that look like headings (Title Case, short length)
    - Group subsequent lines as section content
    Returns list of (title, content).
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    sections: List[Tuple[str, str]] = []

    def is_heading(line: str) -> bool:
        if len(line) > 80:
            return False
        # Title Case heuristic: most words start uppercase
        tokens = [t for t in line.split() if t.isalpha()]
        if not tokens:
            return False
        upper_ratio = sum(1 for t in tokens if t[0].isupper()) / len(tokens)
        return upper_ratio > 0.6

    current_title = "Introduction"
    current_buf: List[str] = []
    for line in lines:
        if is_heading(line):
            # flush previous
            if current_buf:
                sections.append((current_title, " ".join(current_buf)))
                current_buf = []
            current_title = line
        else:
            current_buf.append(line)
    if current_buf:
        sections.append((current_title, " ".join(current_buf)))

    return sections


def parse_document(text: str) -> Dict[str, Any]:
    """Produce topics and concept-level chunks from raw text.

    Output shape:
    {
        "topics": ["Binary Search", ...],
        "concepts": [{"title": str, "content": str}],
    }
    """
    clean = normalize_text(text)
    sections = split_into_sections(clean)
    topics = [title for title, _ in sections]
    concepts = [{"title": title, "content": content} for title, content in sections]
    return {"topics": topics, "concepts": concepts}
