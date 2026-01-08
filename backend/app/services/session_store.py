import uuid
from typing import Dict, Any

# GLOBAL in-memory session store
# NOTE: This is fine for development
sessions: Dict[str, Dict[str, Any]] = {}


def create_session(subject: str, topic: str) -> str:
    session_id = str(uuid.uuid4())

    sessions[session_id] = {
        "subject": subject,
        "topic": topic,
        "questions": [],
        "responses": [],
        "confidence": None,
    }

    return session_id


def get_session(session_id: str) -> Dict[str, Any] | None:
    return sessions.get(session_id)


def add_question(session_id: str, question: dict):
    sessions[session_id]["questions"].append(question)


def add_response(session_id: str, response: dict):
    sessions[session_id]["responses"].append(response)


def set_confidence(session_id: str, confidence: dict):
    sessions[session_id]["confidence"] = confidence
