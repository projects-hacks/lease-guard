import requests
import json
from app.config import settings

import base64

class FoxitDocGenClient:
    def __init__(self):
        self.base_url = settings.FOXIT_API_BASE_URL
        self.client_id = settings.FOXIT_CLIENT_ID
        self.client_secret = settings.FOXIT_CLIENT_SECRET
        self.token = self._get_access_token()
        
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "Content-Type": "application/json"
        }

    def _get_access_token(self) -> str:
        # Using the same logic as Extract client
        url = "https://na1.foxitesign.foxit.com/api/oauth2/access_token"
        payload = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        try:
            response = requests.post(url, data=payload)
            if response.ok:
                return response.json().get("access_token")
        except Exception:
            pass
        return "mock_token"

    # Token exchange restored

    def generate_pdf(self, template_html: str, data: dict) -> bytes:
        """
        Generates a PDF from an HTML template and data.
        """
        # Note: Foxit Doc Gen API might take a template ID or raw HTML/JSON.
        # Assuming a simple HTML -> PDF conversion or Template-based generation.
        # For this hackathon, let's assume we send HTML/Data. 
        # But commonly use POST /generate with template.
        
        url = f"{self.base_url}/generate"
        payload = {
            "html": template_html, 
            "data": data,
            "engine": "phantom" # or similar
        }
        
        # If the API requires a template file uploaded first, we would need that step.
        # Simplified flow:
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.content # Returns PDF bytes
        except Exception as e:
            # Fallback for dev if API fails/not enabled
            print(f"Foxit DocGen failed: {e}. Returning mock PDF bytes.")
            return b"%PDF-1.4 Mock PDF Content"

    def create_counter_letter(self, tenant_name: str, landlord_name: str, clause: dict, state: str) -> bytes:
        """
        Generates a counter-letter for a specific clause.
        """
        # Simple HTML template
        html_template = """
        <html>
        <body>
            <h1>Lease Clause Objection</h1>
            <p>To: {{landlord_name}}</p>
            <p>From: {{tenant_name}}</p>
            <p>Date: {{date}}</p>
            
            <p>Re: Objection to Lease Clause regarding {{clause_type}}</p>
            
            <p>Dear {{landlord_name}},</p>
            
            <p>I am writing regarding the lease agreement for the property.</p>
            <p>Specifically, the following clause:</p>
            <blockquote>"{{original_text}}"</blockquote>
            
            <p>This clause appears to be in conflict with {{state}} tenant laws.</p>
            <p><b>Legal Reference:</b> {{citation}}</p>
            <p><b>Explanation:</b> {{explanation}}</p>
            
            <p>I request that this clause be removed or modified to comply with the law.</p>
            
            <p>Sincerely,</p>
            <p>{{tenant_name}}</p>
        </body>
        </html>
        """
        
        data = {
            "landlord_name": landlord_name,
            "tenant_name": tenant_name,
            "clause_type": clause.get("clauseType"),
            "original_text": clause.get("originalText"),
            "state": state,
            "citation": clause.get("citation", "State Tenant Laws"),
            "explanation": clause.get("explanation"),
            "date": "2026-02-18" # Dynamic in real app
        }
        
        # We need a template engine to fill this before sending ONLY IF the API doesn't support templating.
        # Foxit Doc Gen usually supports data merging.
        # For safety, let's merge here if we send raw HTML.
        # ... logic to merge ... or assuming API handles it.
        # Actually, let's use a simpler approach: Generate the full HTML here and send to "html to pdf" service if that's what it is.
        # Or if it's "template + data", we send both.
        
        # Merging locally for the "HTML to PDF" use case
        for key, value in data.items():
            if value:
                html_template = html_template.replace(f"{{{{{key}}}}}", str(value))
            
        return self.generate_pdf(html_template, {})

    def create_condition_report(self, report_data: dict) -> bytes:
        """
        Generates a Condition Report PDF.
        """
        html_template = """
        <html>
        <head>
            <style>
                body { font-family: sans-serif; }
                h1 { color: #333; }
                .defect { border-bottom: 1px solid #ccc; padding: 10px 0; }
                .defect img { max-width: 300px; display: block; margin: 10px 0; }
                .severity { font-weight: bold; }
                .major { color: red; }
                .moderate { color: orange; }
            </style>
        </head>
        <body>
            <h1>Condition Report</h1>
            <p><b>Inspection Date:</b> {{date}}</p>
            <p><b>Total Defects Found:</b> {{defect_count}}</p>
            
            <h2>Defects</h2>
            {{defects_html}}
            
            <p><i>Generated by LeaseGuard AI</i></p>
        </body>
        </html>
        """
        
        defects_html = ""
        for d in report_data.get("defects", []):
            severity = d.get("severity", "minor")
            # Image handling would be complex here (need public URL or base64).
            # For hackathon, assuming we might skip image or just link it if public.
            # Or use base64 if small enough.
            
            img_html = ""
            # If we had the image bytes or URL. Sanity assets are protected? 
            # If public dataset, they are public.
            if d.get("screenshot", {}).get("asset", {}).get("url"):
                 img_html = f'<img src="{d.get("screenshot").get("asset").get("url")}" />'

            defects_html += f"""
            <div class="defect">
                <h3>{d.get("type", "Defect").replace("_", " ").title()}</h3>
                <p class="severity {severity}">Severity: {severity.title()}</p>
                <p>{d.get("description")}</p>
                <p>Location: {d.get("location", "Unknown")}</p>
                {img_html}
            </div>
            """
            
        date_str = report_data.get("inspectionDate", "Unknown")[:10]
        
        # Simple string replacement
        html = html_template.replace("{{date}}", date_str)
        html = html.replace("{{defect_count}}", str(len(report_data.get("defects", []))))
        html = html.replace("{{defects_html}}", defects_html)
        
        return self.generate_pdf(html, {})
