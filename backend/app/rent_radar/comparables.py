"""
Rent Radar — You.com Search API integration for comparable rental listings.
Searches live listings, calculates overpayment, and provides market context.
"""
import requests
import json
from app.config import settings
from google import genai
from google.genai import types


class RentRadar:
    def __init__(self):
        self.api_key = settings.YOU_COM_API_KEY
        self.base_url = "https://chat-api.you.com/smart"
        
        if settings.GEMINI_API_KEY:
            self.gemini = genai.Client(api_key=settings.GEMINI_API_KEY)

    def search_comparables(self, zip_code: str, bedrooms: int, state: str, city: str = None) -> dict:
        """
        Uses You.com Search API to find comparable rental listings and market data.
        Returns structured market analysis.
        """
        if not self.api_key:
            print("You.com API key missing, falling back to Gemini estimate")
            return self._gemini_fallback(zip_code, bedrooms, state, city)

        location_str = f"{city + ', ' if city else ''}{state} {zip_code}"

        # Query 1: Search for comparable listings
        listings_query = (
            f"apartments for rent {bedrooms} bedroom in {location_str} "
            f"current available listings with accurate pricing data"
        )

        # Query 2: Average rent data for the area
        market_query = (
            f"average rent {bedrooms} bedroom apartment {location_str} 2025 2026 median rent"
        )

        listings_result = self._you_search(listings_query)
        market_result = self._you_search(market_query)

        # Use Gemini to parse the search results into structured data
        return self._parse_results(listings_result, market_result, zip_code, bedrooms, state, city)

    def search_rent_laws(self, state: str, zip_code: str) -> dict:
        """
        Searches for rent control / increase limits for the area.
        """
        if not self.api_key:
            return {"rent_control": "unknown", "sources": []}

        query = f"rent increase limits {state} tenant rights rent control laws 2025 2026 zip code {zip_code}"
        result = self._you_search(query)
        return {
            "raw_answer": result.get("answer", ""),
            "sources": [
                {"title": h.get("title", ""), "url": h.get("url", "")}
                for h in result.get("hits", [])[:5]
            ]
        }

    def _you_search(self, query: str) -> dict:
        """
        Calls You.com Smart API (chat mode with web search).
        """
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "query": query,
            "chat_mode": "research"
        }

        try:
            response = requests.post(self.base_url, headers=headers, json=payload, timeout=30)
            if response.ok:
                return response.json()
            else:
                print(f"You.com API Error: {response.status_code} - {response.text}")
                return {"answer": "", "hits": []}
        except Exception as e:
            print(f"You.com Search Error: {e}")
            return {"answer": "", "hits": []}

    def _parse_results(self, listings: dict, market: dict, zip_code: str, bedrooms: int, state: str, city: str = None) -> dict:
        """
        Uses Gemini to extract structured rent data from You.com search results.
        """
        location_str = f"{city + ', ' if city else ''}{state} {zip_code}"
        prompt = f"""
        Based on these search results about rental prices, extract market data.
        
        SEARCH RESULT 1 (Listings):
        {listings.get("answer", "No results")}
        
        SEARCH RESULT 2 (Market averages):
        {market.get("answer", "No results")}
        
        TARGET: {bedrooms}-bedroom apartment in {location_str}
        
        Return a JSON object:
        {{
            "average": integer (estimated average monthly rent),
            "min": integer (low end),
            "max": integer (high end),
            "confidence": "high" | "medium" | "low",
            "comparables": [
                {{"address": "string or area description", "rent": integer, "source": "string"}}
            ],
            "rent_control_applies": boolean,
            "max_legal_increase": "string or null",
            "market_summary": "1-2 sentence summary"
        }}
        
        If search results are insufficient, provide your best estimate based on the area.
        """

        try:
            response = self.gemini.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini parse error: {e}")
            return self._gemini_fallback(zip_code, bedrooms, state)

    def _gemini_fallback(self, zip_code: str, bedrooms: int, state: str, city: str = None) -> dict:
        """Fallback when You.com is unavailable."""
        location_str = f"{city + ', ' if city else ''}{state} {zip_code}"
        prompt = f"""
        Estimate current market rent for a {bedrooms}-bedroom apartment in {location_str}.
        Return JSON: {{"average": int, "min": int, "max": int, "confidence": "low", 
        "comparables": [], "rent_control_applies": false, "max_legal_increase": null,
        "market_summary": "string"}}
        """
        try:
            response = self.gemini.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception:
            return {
                "average": 2500, "min": 2000, "max": 3000,
                "confidence": "low", "comparables": [],
                "rent_control_applies": False, "max_legal_increase": None,
                "market_summary": "Could not retrieve market data."
            }
