from google import genai
from google.genai import types
from app.config import settings
import json

class RentEstimator:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API Key is missing")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-3-flash-preview" # Updated to user-requested preview model

    def estimate_rent(self, zip_code: str, bedrooms: int, state: str) -> dict:
        """
        Estimates market rent using Gemini 3 Flash Preview knowledge.
        """
        prompt = f"""
        Estimate the current market rent (monthly) for a {bedrooms}-bedroom apartment in {zip_code}, {state}.
        Based on typical market rates for this area (standard condition, not luxury).
        Return a JSON object with:
        - "average": integer (estimated average price)
        - "min": integer (typical low end)
        - "max": integer (typical high end)
        - "confidence": "high" | "medium" | "low"
        Do not explain, just return JSON.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            return json.loads(response.text)
        except Exception as e:
            print(f"Rent Estimation Error: {e}")
            # Fallback mock
            return {"average": 2500, "min": 2000, "max": 3000, "confidence": "low"}
