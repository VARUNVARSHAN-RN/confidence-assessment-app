import os
import requests
import json
import re

# Read Gemini config from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Preferred model alias (without "models/" prefix). We'll auto-resolve if invalid.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_API_VERSION = os.getenv("GEMINI_API_VERSION", "v1beta")
GEMINI_BASE = "https://generativelanguage.googleapis.com"


def _list_models() -> list:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")
    url = f"{GEMINI_BASE}/{GEMINI_API_VERSION}/models"
    resp = requests.get(url, params={"key": GEMINI_API_KEY}, timeout=20)
    # Don't raise here; caller will handle empty list
    try:
        data = resp.json()
    except Exception:
        print("[Gemini] Failed to parse ListModels response:", resp.text[:500])
        return []
    models = data.get("models", [])
    return models


def _resolve_supported_model(preferred_alias: str) -> str:
    """
    Returns model name without the leading "models/". Picks a model that supports generateContent.
    If preferred_alias is available, use it; otherwise pick first suitable Gemini model.
    """
    models = _list_models()
    if not models:
        # Fall back to common defaults
        return preferred_alias

    # Normalize names to strip leading "models/"
    normalized = []
    for m in models:
        name = m.get("name", "")
        if name.startswith("models/"):
            name = name.split("/", 1)[1]
        methods = m.get("supportedGenerationMethods", [])
        normalized.append((name, methods))

    # Prefer exact match
    for name, methods in normalized:
        if name == preferred_alias and ("generateContent" in methods or "generateText" in methods):
            return name

    # Otherwise pick a Gemini model that supports generateContent
    # Prefer flash -> pro variants for speed
    candidates = [
        name for name, methods in normalized
        if (name.startswith("gemini") and ("generateContent" in methods))
    ]
    if candidates:
        # Prefer flash models first
        flash_candidates = [c for c in candidates if "flash" in c]
        if flash_candidates:
            return flash_candidates[0]
        return candidates[0]

    # Final fallback: any model that supports generateText
    text_candidates = [
        name for name, methods in normalized
        if "generateText" in methods
    ]
    if text_candidates:
        return text_candidates[0]

    return preferred_alias


def _strip_markdown_fences(text: str) -> str:
    text = re.sub(r"^```json\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^```\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE)
    return text.strip()


def call_gemini(prompt: str) -> str:
    """
    Low-level Gemini call. Returns raw text output. Auto-discovers a supported model
    and retries once on 404/not-supported errors. Falls back to generateText if needed.
    """

    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")

    def _generate_content(model_name: str):
        url = f"{GEMINI_BASE}/{GEMINI_API_VERSION}/models/{model_name}:generateContent"
        resp = requests.post(
            f"{url}?key={GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            },
            timeout=30,
        )
        return resp

    def _generate_text(model_name: str):
        # Some legacy text models support generateText with different payload
        url = f"{GEMINI_BASE}/{GEMINI_API_VERSION}/models/{model_name}:generateText"
        resp = requests.post(
            f"{url}?key={GEMINI_API_KEY}",
            json={
                "prompt": {"text": prompt}
            },
            timeout=30,
        )
        return resp

    # First try with preferred or auto-resolved model
    model = _resolve_supported_model(GEMINI_MODEL)
    print(f"[Gemini] Using model: {model} (version={GEMINI_API_VERSION})")

    resp = _generate_content(model)
    if resp.status_code == 404 or (resp.status_code == 400 and "not supported" in resp.text.lower()):
        print("[Gemini] generateContent not supported or model not found. Auto-discovering...")
        # Re-resolve and retry once
        model = _resolve_supported_model(model)
        print(f"[Gemini] Retrying with model: {model}")
        resp = _generate_content(model)

    # If still error, attempt generateText
    if resp.status_code >= 400:
        print(f"[Gemini] generateContent failed ({resp.status_code}). Trying generateText...")
        resp = _generate_text(model)

    # Raise if request ultimately failed
    resp.raise_for_status()
    data = resp.json()

    # Try to parse text from generateContent response
    text = None
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        # Try generateText response shape
        try:
            text = data["candidates"][0]["output"]
        except Exception:
            pass

    if not text:
        raise RuntimeError("Unexpected response from Gemini API: no text found")
    return text


def analyze_response(question: str, user_answer: str) -> dict:
    """
    Uses Gemini to analyze a user's answer and extract confidence signals.
    """

    prompt = f"""
You are an expert educational evaluator.

Question: {question}

Student's Answer:
{user_answer}

Evaluate the student's response on these dimensions:
1. Clarity of explanation (0-100)
2. Correctness of understanding (0-100)
3. Self-confidence alignment (0-100)
4. Quality of reasoning and examples (0-100)

Provide constructive feedback focusing on strengths and areas for improvement.

Output ONLY valid JSON (no markdown):
{{
  "clarity": <number>,
  "correctness": <number>,
  "confidence": <number>,
  "reasoning_quality": <number>,
  "short_feedback": "<your feedback>"
}}
"""

    try:
        text = call_gemini(prompt)
        text = _strip_markdown_fences(text)
        result = json.loads(text)
        # Validate required fields
        required = ["clarity", "correctness", "confidence", "reasoning_quality", "short_feedback"]
        if all(k in result for k in required):
            return result
        else:
            raise ValueError("Missing required fields in Gemini response")
    except Exception as e:
        print(f"Gemini analysis failed: {e}")
        # Fallback when API fails
        return {
            "clarity": 55,
            "correctness": 55,
            "confidence": 50,
            "reasoning_quality": 55,
            "short_feedback": "Unable to generate AI analysis. Please try again or check your explanation detail.",
        }
