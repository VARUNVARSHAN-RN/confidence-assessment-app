"""
Concept explanation engine.

Generates simple-language explanations with real-world examples.
Uses Gemini when available; falls back to rule-based formatting.
"""
from typing import Dict
from .gemini_analyzer import call_gemini


def explain_concept(title: str, content: str) -> Dict[str, str]:
    """
    Return structured JSON:
    {
      "concept": title,
      "explanation": str,
      "example": str,
    }
    """
    prompt = f"""
You are a learning assistant.
Explain the concept below in simple language and provide a practical example.

Title: {title}
Content: {content}

Return STRICT JSON with keys:
- explanation (string)
- example (string)
Only return JSON.
"""
    try:
        import json
        text = call_gemini(prompt)
        data = json.loads(text)
        return {
            "concept": title,
            "explanation": data.get("explanation", ""),
            "example": data.get("example", ""),
        }
    except Exception:
        # Fallback: simple rephrasing
        explanation = f"{title}: In simple terms, this refers to {content[:180]}..."
        example = "For example, imagine applying this concept in a small project or daily task."
        return {"concept": title, "explanation": explanation, "example": example}
