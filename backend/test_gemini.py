import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Test Gemini API directly
api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")

print(f"API Key: {api_key[:20]}..." if api_key else "NOT FOUND")
print(f"Model: {model}")

import requests
import json

url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={api_key}"

payload = {
    "contents": [{
        "parts": [{"text": "Generate a JSON with keys 'question' and 'difficulty' about Python programming."}]
    }]
}

print(f"\nCalling: {url[:80]}...")
try:
    response = requests.post(url, json=payload, timeout=20)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.ok:
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        print(f"\nGenerated text:\n{text}")
    else:
        print(f"ERROR: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()
