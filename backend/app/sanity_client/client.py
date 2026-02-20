import requests
import json
import urllib.parse
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

    def _query(self, groq_query: str, params: dict = None) -> any:
        """
        Generic Sanity GROQ query method.
        """
        encoded_query = urllib.parse.quote(groq_query)
        url = f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/query/{self.dataset}?query={encoded_query}"
        
        # Add params
        if params:
            for key, value in params.items():
                url += f"&${key}={urllib.parse.quote(str(value))}"
        
        headers = {
            "Authorization": f"Bearer {self.token}",
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json().get("result")

    def save_analysis(self, analysis_data: dict, user_id: str, filename: str, state: str = "CA") -> str:
        """
        Saves the analysis result to Sanity.
        """
        doc_id = str(uuid.uuid4())
        
        doc = {
            "_id": doc_id,
            "_type": "leaseAnalysis",
            "userId": user_id,
            "uploadDate": datetime.utcnow().isoformat(),
            "propertyAddress": analysis_data.get("propertyAddress", ""),
            "landlordName": analysis_data.get("landlordName", ""),
            "tenantName": analysis_data.get("tenantName", ""),
            "state": state,
            "extractedClauses": analysis_data.get("extractedClauses", []),
            "overallRiskScore": analysis_data.get("overallRiskScore", 0),
            "summary": analysis_data.get("summary", ""),
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
        
        result = response.json()
        print(f"Sanity Response: {json.dumps(result)}")
        
        return doc_id

    def get_analysis(self, analysis_id: str) -> dict | None:
        """
        Fetches a lease analysis by ID.
        """
        query = f'*[_type == "leaseAnalysis" && _id == "{analysis_id}"][0]'
        return self._query(query)

    def get_condition_report(self, report_id: str) -> dict | None:
        """
        Fetches a condition report with expanded image assets.
        """
        query = f'*[_type == "conditionReport" && _id == "{report_id}"][0]{{..., defects[]{{..., screenshot{{asset->{{url}}}}}}}}'
        return self._query(query)

    def get_clause_library(self, state: str = None) -> list:
        """
        Fetches the clause library, optionally filtered by state.
        """
        if state:
            query = f'*[_type == "leaseClause" && defined(stateRules.{state})]'
        else:
            query = '*[_type == "leaseClause"] | order(commonName asc)'
        return self._query(query) or []
