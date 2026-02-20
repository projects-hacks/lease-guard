"""
Maintenance Request Documenter — Voice-first maintenance issue reporting.
Tenants describe issues verbally → transcribed with Deepgram Audio Intelligence →
structured into a formal maintenance request → generated as PDF via Foxit.
"""
from google import genai
from google.genai import types
from app.config import settings
import json
from datetime import datetime


class MaintenanceDocumenter:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API Key is missing")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-3-flash-preview"

    def structure_request(self, transcript: str, topics: list = None, intents: list = None) -> dict:
        """
        Takes a raw voice transcript of a maintenance issue and structures it
        into a formal maintenance request with categorization.
        """
        topic_context = f"\nDetected topics: {', '.join(topics)}" if topics else ""
        intent_context = f"\nDetected intents: {', '.join(intents)}" if intents else ""
        
        prompt = f"""
        A tenant described a maintenance issue verbally. Structure this into a formal maintenance request.
        
        TRANSCRIPT: "{transcript}"
        {topic_context}
        {intent_context}
        
        Return JSON:
        {{
            "issue_category": "plumbing" | "electrical" | "hvac" | "structural" | "pest" | "appliance" | "safety" | "other",
            "urgency": "emergency" | "urgent" | "routine",
            "title": "Short descriptive title (max 10 words)",
            "description": "Clear, professional description of the issue",
            "location": "Where in the unit (e.g., kitchen, bathroom, bedroom)",
            "tenant_actions": "Any actions the tenant has already taken",
            "requested_action": "What the tenant is requesting",
            "safety_concern": boolean,
            "date_reported": "{datetime.now().strftime('%Y-%m-%d')}",
            "original_transcript": "the original transcript verbatim"
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            result = json.loads(response.text)
            result["original_transcript"] = transcript
            result["date_reported"] = datetime.now().strftime("%Y-%m-%d")
            return result
        except Exception as e:
            print(f"Maintenance structuring failed: {e}")
            return {
                "issue_category": "other",
                "urgency": "routine",
                "title": "Maintenance Request",
                "description": transcript,
                "location": "Not specified",
                "tenant_actions": "",
                "requested_action": "Please inspect and repair",
                "safety_concern": False,
                "date_reported": datetime.now().strftime("%Y-%m-%d"),
                "original_transcript": transcript
            }

    def generate_request_html(self, data: dict, tenant_name: str = "Tenant", 
                               landlord_name: str = "Property Manager",
                               property_address: str = "") -> str:
        """
        Generates HTML for the maintenance request letter.
        """
        urgency_color = {
            "emergency": "#dc2626",
            "urgent": "#f59e0b", 
            "routine": "#22c55e"
        }.get(data.get("urgency", "routine"), "#6b7280")
        
        safety_badge = ""
        if data.get("safety_concern"):
            safety_badge = '<div style="background:#fef2f2;border:1px solid #dc2626;color:#dc2626;padding:8px 12px;border-radius:6px;font-weight:bold;margin:12px 0;">⚠️ SAFETY CONCERN — Requires Immediate Attention</div>'
        
        return f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Helvetica Neue', sans-serif; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 40px; color: #1a1a1a; }}
                h1 {{ color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 8px; font-size: 22px; }}
                .header {{ display: flex; justify-content: space-between; margin-bottom: 20px; }}
                .urgency {{ display: inline-block; background: {urgency_color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; }}
                .category {{ display: inline-block; background: #e5e7eb; padding: 4px 12px; border-radius: 12px; font-size: 12px; }}
                .field {{ margin: 12px 0; }}
                .field-label {{ font-weight: bold; color: #4b5563; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }}
                .field-value {{ margin-top: 4px; }}
                .transcript {{ background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; color: #6b7280; font-style: italic; font-size: 13px; margin: 16px 0; }}
                .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }}
            </style>
        </head>
        <body>
            <h1>Maintenance Request</h1>
            
            <div>
                <span class="urgency">{data.get('urgency', 'routine')}</span>
                <span class="category">{data.get('issue_category', 'other').replace('_', ' ').title()}</span>
            </div>
            
            {safety_badge}
            
            <div class="field">
                <div class="field-label">Date Reported</div>
                <div class="field-value">{data.get('date_reported', 'N/A')}</div>
            </div>
            
            <div class="field">
                <div class="field-label">To</div>
                <div class="field-value">{landlord_name}</div>
            </div>
            
            <div class="field">
                <div class="field-label">From</div>
                <div class="field-value">{tenant_name}</div>
            </div>
            
            {'<div class="field"><div class="field-label">Property</div><div class="field-value">' + property_address + '</div></div>' if property_address else ''}
            
            <div class="field">
                <div class="field-label">Issue</div>
                <div class="field-value" style="font-size: 18px; font-weight: bold;">{data.get('title', 'Maintenance Issue')}</div>
            </div>
            
            <div class="field">
                <div class="field-label">Location</div>
                <div class="field-value">{data.get('location', 'Not specified')}</div>
            </div>
            
            <div class="field">
                <div class="field-label">Description</div>
                <div class="field-value">{data.get('description', '')}</div>
            </div>
            
            <div class="field">
                <div class="field-label">Requested Action</div>
                <div class="field-value">{data.get('requested_action', 'Please inspect and repair')}</div>
            </div>
            
            {'<div class="field"><div class="field-label">Actions Already Taken</div><div class="field-value">' + data.get("tenant_actions", "") + '</div></div>' if data.get("tenant_actions") else ''}
            
            <div class="transcript">
                <div class="field-label" style="margin-bottom:8px;">Original Voice Transcript</div>
                "{data.get('original_transcript', '')}"
            </div>
            
            <p>Please address this maintenance issue at your earliest convenience as required by applicable tenant-landlord laws.</p>
            
            <p>Sincerely,<br/>{tenant_name}</p>
            
            <div class="footer">
                Generated by LeaseGuard AI • Voice transcription by Deepgram Nova-3 • Document by Foxit
            </div>
        </body>
        </html>
        """
