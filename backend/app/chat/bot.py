"""
Voice Q&A — Lease-context-aware voice assistant.
Searches the user's stored lease clauses from Sanity and answers based on actual lease data.
"""
from google import genai
from google.genai import types
from app.config import settings
import json


class LegalChatBot:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API Key is missing")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-3-flash-preview"
        
        self.generic_system = """
        You are 'LeaseGuard AI', a helpful legal assistant for tenants.
        Your goal is to answer questions about rental laws, lease agreements, and tenant rights clearly and concisely.
        
        Guidelines:
        - Provide accurate, general legal information based on US tenant law (prioritize California/New York if unspecified).
        - Always clarify that you are an AI and this is not professional legal advice.
        - Be empathetic to tenants facing issues.
        - Keep answers concise (max 3-4 sentences) suitable for voice conversation.
        """

    def get_legal_answer(self, user_query: str) -> str:
        """Generic legal Q&A without lease context."""
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_query,
                config=types.GenerateContentConfig(
                    system_instruction=self.generic_system
                )
            )
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I'm sorry, I'm having trouble right now. Please try again."

    def get_lease_answer(self, user_query: str, clauses: list, state: str = "CA") -> str:
        """
        Lease-context-aware Q&A. Searches the user's actual lease clauses and answers
        based on what their specific lease says.
        """
        # Format clauses for context
        clause_context = self._format_clauses(clauses)
        
        system_instruction = f"""
        You are 'LeaseGuard AI', answering questions about a SPECIFIC tenant's lease.
        
        You have access to the tenant's actual lease clauses below. Answer ONLY based on these clauses.
        If the lease doesn't cover the topic, say so and provide general {state} tenant law guidance.
        
        CRITICAL RULES:
        - ALWAYS cite the specific clause type/number from the lease.
        - Use plain English (the tenant may not be comfortable with legal jargon).
        - Keep answers concise (3-4 sentences max, this is voice conversation).
        - At the end, offer a helpful follow-up action (e.g., "Want me to generate a letter?").
        - Clarify you are AI, not a lawyer.
        
        THE TENANT'S LEASE CLAUSES:
        {clause_context}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_query,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I'm sorry, I couldn't process your question. Please try again."

    def _format_clauses(self, clauses: list) -> str:
        """Formats extracted clauses for the system prompt."""
        if not clauses:
            return "No lease clauses available."
        
        formatted = []
        for i, clause in enumerate(clauses, 1):
            clause_type = clause.get("clauseType", "unknown").replace("_", " ").title()
            text = clause.get("originalText", "")
            risk = clause.get("riskLevel", "green")
            explanation = clause.get("explanation", "")
            citation = clause.get("citation", "")
            
            entry = f"Clause {i} ({clause_type}) [Risk: {risk.upper()}]:\n"
            entry += f"  Text: \"{text}\"\n"
            if explanation:
                entry += f"  Meaning: {explanation}\n"
            if citation:
                entry += f"  Legal Ref: {citation}\n"
            formatted.append(entry)
        
        return "\n".join(formatted)
