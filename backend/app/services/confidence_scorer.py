def compute_confidence(session):
    responses = session["responses"]
    analyses = session["analysis"]

    if not responses or not analyses:
        return None

    # ---- Average Response Time ----
    avg_time = sum(r["time_taken_seconds"] for r in responses) / len(responses)

    # ---- Gemini Clarity Score ----
    avg_clarity = sum(a["clarity_score"] for a in analyses) / len(analyses)

    # ---- Consistency Score ----
    consistency = len(
        [a for a in analyses if a["confidence_language"] == "high"]
    ) / len(analyses)

    # ---- Weighted Confidence Score ----
    confidence_score = (
        avg_clarity * 40 +
        (1 / avg_time) * 30 +
        consistency * 30
    ) * 100

    confidence_score = min(round(confidence_score), 100)

    # ---- Label ----
    if confidence_score >= 75:
        label = "Strong Confidence"
    elif confidence_score >= 50:
        label = "Moderate Confidence"
    else:
        label = "Needs Clarity"

    # ---- Insights ----
    insights = [a["insight"] for a in analyses]

    return {
        "confidence_score": confidence_score,
        "confidence_label": label,
        "average_response_time": round(avg_time),
        "consistency_score": round(consistency * 100),
        "insights": insights
    }
