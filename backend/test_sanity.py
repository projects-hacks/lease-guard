from app.config import settings
import requests
import json
import os
from datetime import datetime

# Mock settings loading if not in app context
if not settings.SANITY_PROJECT_ID:
    from dotenv import load_dotenv
    load_dotenv("backend/.env")
    settings.SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
    settings.SANITY_DATASET = os.getenv("SANITY_DATASET")
    settings.SANITY_API_TOKEN = os.getenv("SANITY_API_TOKEN")

print(f"Project ID: {settings.SANITY_PROJECT_ID}")
print(f"Dataset: {settings.SANITY_DATASET}")
# print(f"Token: {settings.SANITY_API_TOKEN}") # Don't print secret

base_url = f"https://{settings.SANITY_PROJECT_ID}.api.sanity.io/v2024-02-18/data/mutate/{settings.SANITY_DATASET}"

doc = {
    "_type": "test_doc",
    "name": "Sanity Connection Test",
    "timestamp": datetime.utcnow().isoformat()
}

mutations = {
    "mutations": [
        {
            "create": doc
        }
    ]
}

headers = {
    "Authorization": f"Bearer {settings.SANITY_API_TOKEN}",
    "Content-Type": "application/json"
}

print(f"Sending request to {base_url}...")
try:
    response = requests.post(base_url, headers=headers, json=mutations)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    response.raise_for_status()
    result = response.json()
    
    if 'results' in result and len(result['results']) > 0:
        print(f"Success! Doc ID: {result['results'][0]['id']}")
    else:
        print("Success response but no ID found?")

except Exception as e:
    print(f"Error: {e}")
