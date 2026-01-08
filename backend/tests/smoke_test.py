import json
import requests

BASE = "http://127.0.0.1:5000/api/assessment"


def test_ingest():
    payload = {
        "text": "Binary Search is a divide-and-conquer algorithm used on sorted arrays to find a target by halving the search space."
    }
    r = requests.post(f"{BASE}/ingest", json=payload, timeout=10)
    r.raise_for_status()
    data = r.json()
    print("INGEST:", json.dumps(data, indent=2)[:400])


def test_explain():
    payload = {
        "title": "Binary Search",
        "content": "Maintain low/high pointers, compute mid, compare target with middle element and adjust bounds until found."
    }
    r = requests.post(f"{BASE}/explain", json=payload, timeout=10)
    r.raise_for_status()
    data = r.json()
    print("EXPLAIN:", json.dumps(data, indent=2)[:400])


if __name__ == "__main__":
    test_ingest()
    test_explain()
