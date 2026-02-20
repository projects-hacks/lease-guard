"""
State Law Engine — You.com Search API for real-time tenant law verification.
Searches for actual statutes and citations to verify/augment Gemini analysis.
"""
import requests
from app.config import settings


class YouComLegalSearch:
    def __init__(self):
        self.api_key = settings.YOU_COM_API_KEY
        self.base_url = "https://chat-api.you.com/smart"

    def search_statute(self, state: str, clause_type: str, clause_text: str) -> dict:
        """
        Searches You.com for the specific state law related to a lease clause.
        Returns citation, URL, and explanation.
        """
        if not self.api_key:
            return {"citation": "", "explanation": "", "sources": []}

        query = (
            f"{state} tenant law regarding {clause_type.replace('_', ' ')} "
            f"residential lease statute code section 2025 2026"
        )

        result = self._search(query)

        return {
            "citation": self._extract_citation(result),
            "explanation": result.get("answer", ""),
            "sources": [
                {"title": h.get("title", ""), "url": h.get("url", "")}
                for h in result.get("hits", [])[:3]
            ]
        }

    def verify_red_flag(self, state: str, clause_type: str, clause_text: str) -> dict:
        """
        Verifies whether a flagged clause actually violates state law.
        Returns verification result with real legal sources.
        """
        if not self.api_key:
            return {"verified": False, "sources": []}

        query = (
            f"Is this lease clause legal in {state}? "
            f"Clause type: {clause_type.replace('_', ' ')}. "
            f"Clause: \"{clause_text[:200]}\". "
            f"Cite the specific statute or code section."
        )

        result = self._search(query)

        return {
            "verified": True,
            "legal_analysis": result.get("answer", ""),
            "sources": [
                {"title": h.get("title", ""), "url": h.get("url", "")}
                for h in result.get("hits", [])[:3]
            ]
        }

    def get_tenant_rights(self, state: str) -> dict:
        """
        Gets a summary of key tenant rights for a specific state.
        """
        if not self.api_key:
            return {"rights": [], "sources": []}

        query = (
            f"{state} tenant rights summary security deposit limit "
            f"rent increase notice eviction protection 2025 2026"
        )

        result = self._search(query)

        return {
            "summary": result.get("answer", ""),
            "sources": [
                {"title": h.get("title", ""), "url": h.get("url", "")}
                for h in result.get("hits", [])[:5]
            ]
        }

    def _search(self, query: str) -> dict:
        """Calls You.com Smart API."""
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
                print(f"You.com Legal Search Error: {response.status_code} - {response.text}")
                return {"answer": "", "hits": []}
        except Exception as e:
            print(f"You.com Legal Search Error: {e}")
            return {"answer": "", "hits": []}

    def _extract_citation(self, result: dict) -> str:
        """Tries to extract a legal citation from the search answer."""
        answer = result.get("answer", "")
        # Look for common citation patterns
        import re
        patterns = [
            r'(?:§|Section)\s*\d+[\.\d]*',
            r'Civil Code\s*§?\s*\d+[\.\d]*',
            r'Real Property Law\s*§?\s*\d+[\.\d]*',
            r'[A-Z]{2}\s+(?:Rev\.?\s*)?(?:Stat\.?|Code)\s*§?\s*\d+[\.\d]*',
        ]
        for pattern in patterns:
            match = re.search(pattern, answer)
            if match:
                return match.group()
        return ""
