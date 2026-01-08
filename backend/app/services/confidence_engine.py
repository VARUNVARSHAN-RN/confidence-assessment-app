"""
Confidence scoring engine.

Computes confidence metrics from analysis signals and produces
structured JSON outputs for concept-level evaluation.
"""
from typing import List, Dict, Any


def evaluate_concept(concept: str, analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    analyses: list of items with keys {clarity, correctness, confidence, reasoning_quality} (0-100)

    Returns:
    {
      "concept": str,
      "confidence_score": int,  # 0-100
      "status": "Strong"|"Medium"|"Weak",
      "weak_points": [str],
      "recommendation": str,
    }
    """
    if not analyses:
        return {
            "concept": concept,
            "confidence_score": 0,
            "status": "Weak",
            "weak_points": ["insufficient data"],
            "recommendation": "Collect more responses and re-evaluate.",
        }

    avg = _average_scores(analyses)
    # Weighted blend prioritizing correctness and clarity
    score = round(
        0.4 * avg["correctness"] + 0.35 * avg["clarity"] + 0.15 * avg["confidence"] + 0.10 * avg["reasoning_quality"]
    )

    status = _status_label(score)
    weak_points = _weak_points(avg)
    recommendation = _recommendation(status)

    return {
        "concept": concept,
        "confidence_score": score,
        "status": status,
        "weak_points": weak_points,
        "recommendation": recommendation,
    }


def _average_scores(analyses: List[Dict[str, Any]]) -> Dict[str, float]:
    keys = ["clarity", "correctness", "confidence", "reasoning_quality"]
    totals = {k: 0.0 for k in keys}
    for a in analyses:
        for k in keys:
            try:
                totals[k] += float(a.get(k, 0))
            except Exception:
                totals[k] += 0.0
    n = max(len(analyses), 1)
    return {k: round(totals[k] / n, 2) for k in keys}


def _status_label(score: int) -> str:
    if score >= 75:
        return "Strong"
    if score >= 50:
        return "Medium"
    return "Weak"


def _weak_points(avg: Dict[str, float]) -> List[str]:
    points: List[str] = []
    if avg["correctness"] < 60:
        points.append("correctness")
    if avg["clarity"] < 60:
        points.append("clarity")
    if avg["reasoning_quality"] < 60:
        points.append("reasoning quality")
    if avg["confidence"] < 50:
        points.append("self-confidence alignment")
    return points or ["review fundamentals"]


def _recommendation(status: str) -> str:
    if status == "Strong":
        return "Advance to application and interview-style questions."
    if status == "Medium":
        return "Re-explain with step-by-step examples and practice moderate questions."
    return "Re-explain with simpler analogies, then scaffold from basic to harder questions."
