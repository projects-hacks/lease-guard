from google import genai
from google.genai import types
from app.config import settings
import json
import os

class LeaseAnalyzer:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API Key is missing")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-3-flash-preview" # Updated to user-requested preview model

    def analyze_lease(self, extracted_text: str, state: str) -> dict:
        """
        Analyzes the lease text using Gemini 1.5 Pro.
        """
        system_instruction = """You are a tenant rights attorney. Analyze this residential lease.
Identify key clauses, including both RISKS and NON-RISKY KEY TERMS (like Rent Amount, Deposit amount, Utilities, Pet Policy). 

Be EXTREMELY concise but use plain English.
1. CLASSIFY: Clause type (e.g., "Late Fee", "Security Deposit", "Automatic Renewal"). Use Title Case. NEVER use underscores or camelCase. Make it human readable.
2. EXTRACT: Quote the clause exactly.
3. FLAG: GREEN (safe/standard terms like Rent Amount), YELLOW (mild warning), or RED (high risk/illegal).
4. EXPLAIN: Provide a 1-2 sentence user-friendly explanation of what this means for the tenant in plain, simple English.
5. COMPARE: 1 sentence max. Comparison to {state} law if applicable.

Return JSON:
{
  "propertyAddress": "string",
  "landlordName": "string",
  "tenantName": "string",
  "extractedClauses": [
    {
      "clauseType": "string (Title Case, no underscores)",
      "originalText": "string",
      "riskLevel": "green" | "yellow" | "red",
      "explanation": "string (Plain English, conversational)",
      "citation": "string (Legal reference or 'Standard term')"
    }
  ],
  "overallRiskScore": number (0-100, where 100 is high risk),
  "summary": "string (Overall summary of the lease, including any highly unusual terms)"
}
"""
        
        prompt = f"{system_instruction}\n\nThe tenant's state is: {state}\n\nThe lease text is:\n{extracted_text}"

        try:
            # Increase output token limit to prevent JSON truncation
            # and ensure structured output is enabled.
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    max_output_tokens=8192, # Ensure we have enough space for long leases
                    temperature=0.1 # Lower temperature for more deterministic/valid JSON
                )
            )
            
            # The new SDK might return a parsed object if schema is defined, 
            # but for raw JSON mode, we access .text
            if not response.text:
                raise ValueError("Empty response from Gemini")

            return json.loads(response.text)
        except json.JSONDecodeError:
            # Attempt to repair truncated JSON
            print("Warning: JSON Response truncated. Attempting repair.")
            try:
                text = response.text.strip()
                # Naive repair: Close the array and object if missing
                if not text.endswith("}"):
                   text += "}]}" 
                if not text.endswith("]}"): # if only array was open
                   text += "]}"
                if not text.endswith("}"): # if only object was open
                   text += "}"
                return json.loads(text)
            except Exception as repair_error:
                print(f"JSON Repair Failed: {repair_error}")
                # Fallback to returning standard error structure
                return {
                    "extractedClauses": [],
                    "overallRiskScore": 0,
                    "summary": "Analysis too large. Please upload simpler lease."
                }
        except Exception as e:
            print(f"Gemini Analysis Failed: {e}")
            # Mock fallback if quota exceeded or error
            return {
                "extractedClauses": [],
                "overallRiskScore": 0,
                "summary": "Error analyzing lease. Please try again."
            }
