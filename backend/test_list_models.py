import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
API_VERSION = os.getenv("GEMINI_API_VERSION", "v1beta")
BASE = "https://generativelanguage.googleapis.com"

if not API_KEY:
    print("GEMINI_API_KEY not set")
    raise SystemExit(1)

url = f"{BASE}/{API_VERSION}/models"
params = {"key": API_KEY}
print("Listing models from:", url)
resp = requests.get(url, params=params, timeout=20)
print("Status:", resp.status_code)
try:
    data = resp.json()
except Exception as e:
    print("Failed to parse JSON:", e)
    print(resp.text[:1000])
    raise

models = data.get("models", [])
print(f"Found {len(models)} models")
for m in models:
    name = m.get("name")
    display = m.get("displayName")
    methods = m.get("supportedGenerationMethods")
    print(f"- {name} | displayName={display} | methods={methods}")
