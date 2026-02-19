import requests
import json
from datetime import datetime
from app.config import settings
import uuid

class SanityClient:
    def __init__(self):
        self.project_id = settings.SANITY_PROJECT_ID
        self.dataset = settings.SANITY_DATASET
        self.token = settings.SANITY_API_TOKEN
        self.api_version = "2024-02-18"
        self.base_url = f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/mutate/{self.dataset}"

    def save_analysis(self, analysis_data: dict, user_id: str, filename: str) -> str:
        """
        Saves the analysis result to Sanity.
        """
        doc_id = str(uuid.uuid4())
        
        doc = {
            "_id": doc_id,
            "_type": "leaseAnalysis",
            "userId": user_id,
            "uploadDate": datetime.utcnow().isoformat(),
            # "originalFilename": filename, # schema doesn't have this yet, maybe add to schema later
            "state": "CA", # TODO: extracted from analysis or input
            "extractedClauses": analysis_data.get("extractedClauses", []),
            "overallRiskScore": analysis_data.get("overallRiskScore", 0),
        }

        mutations = {
            "mutations": [
                {
                    "create": doc
                }
            ]
        }

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        response = requests.post(self.base_url, headers=headers, json=mutations)
        response.raise_for_status()
        
        # We generated the ID, so we can just return it.
        # Check response for errors just in case
        result = response.json()
        print(f"Sanity Response: {json.dumps(result)}")
        
        return doc_id
