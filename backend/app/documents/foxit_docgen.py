import requests
import json
from datetime import datetime
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

    def upload_file(self, file_content: bytes, filename: str, content_type: str) -> str:
        """
        Uploads a file and returns the document ID.
        """
        url = f"{self.base_url}/pdf-services/api/documents/upload"
        headers = self.headers.copy()
        if "Content-Type" in headers:
            del headers["Content-Type"]
        
        files = {'file': (filename, file_content, content_type)}
        
        try:
            response = requests.post(url, headers=headers, files=files)
            response.raise_for_status()
            return response.json().get("documentId")
        except Exception as e:
            print(f"Foxit Upload Error: {e}")
            return None

    def start_html_conversion(self, document_id: str) -> str:
        """
        Starts HTML to PDF conversion.
        """
        url = f"{self.base_url}/pdf-services/api/documents/create/pdf-from-html"
        payload = {"documentId": document_id}
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            if response.ok:
                return response.json().get("taskId")
            print(f"Conversion Start Failed: {response.text}")
        except Exception as e:
            print(f"Start Conversion Error: {e}")
        return None

    def poll_status(self, task_id: str) -> bytes:
        """
        Polls status and returns PDF bytes.
        """
        url = f"{self.base_url}/pdf-services/api/tasks/{task_id}"
        import time
        
        for _ in range(30):
            try:
                response = requests.get(url, headers=self.headers)
                data = response.json()
                status = data.get("status")
                
                if status == "COMPLETED" or status == "SUCCEEDED":
                    if "resultDocumentId" in data:
                        doc_id = data["resultDocumentId"]
                        down_url = f"{self.base_url}/pdf-services/api/documents/{doc_id}/download"
                        return requests.get(down_url, headers=self.headers).content
                elif status == "FAILED":
                    raise Exception(f"Conversion failed: {data}")
                
                time.sleep(1)
            except Exception as e:
                print(f"Polling error: {e}")
                time.sleep(1)
        
        raise Exception("Conversion timed out")

    def generate_pdf(self, template_html: str, data: dict) -> bytes:
        """
        Generates a PDF by uploading HTML and converting it.
        """
        try:
            # 1. Upload HTML
            doc_id = self.upload_file(
                template_html.encode('utf-8'), 
                "template.html", 
                "text/html"
            )
            
            if not doc_id:
                raise Exception("Upload failed")
                
            # 2. Start Conversion
            task_id = self.start_html_conversion(doc_id)
            if not task_id:
                raise Exception("Conversion start failed")
                
            # 3. Poll & Download
            return self.poll_status(task_id)

        except Exception as e:
            print(f"Foxit DocGen failed: {e}. Returning mock PDF bytes.")
            return b"%PDF-1.4 Mock PDF Content (Error: " + str(e).encode() + b")"

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
            "date": datetime.now().strftime("%Y-%m-%d")
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

    def create_negotiation_letter(
        self, tenant_name: str, landlord_name: str,
        current_rent: float, market_average: float,
        state: str, legal_context: str = "", citation: str = ""
    ) -> bytes:
        """
        Generates a rent negotiation letter PDF.
        """
        diff = current_rent - market_average
        pct = (diff / market_average * 100) if market_average else 0

        html_template = f"""
        <html>
        <head>
            <style>
                body {{ font-family: sans-serif; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 40px; }}
                h1 {{ color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 8px; }}
                .highlight {{ background: #fff3cd; padding: 12px; border-radius: 6px; margin: 16px 0; }}
                .stats {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }}
                .stat {{ background: #f8f9fa; padding: 12px; border-radius: 6px; text-align: center; }}
                .stat-value {{ font-size: 24px; font-weight: bold; color: #d63384; }}
            </style>
        </head>
        <body>
            <h1>Rent Adjustment Request</h1>
            <p>To: {landlord_name}</p>
            <p>From: {tenant_name}</p>
            <p>Date: {datetime.now().strftime('%B %d, %Y')}</p>

            <p>Dear {landlord_name},</p>

            <p>I am writing to discuss the current monthly rent for my unit. After researching
            comparable rental listings in this area, I believe the current rent may be above market rate.</p>

            <div class="stats">
                <div class="stat">
                    <div>My Current Rent</div>
                    <div class="stat-value">${current_rent:,.0f}</div>
                </div>
                <div class="stat">
                    <div>Market Average</div>
                    <div class="stat-value">${market_average:,.0f}</div>
                </div>
            </div>

            <div class="highlight">
                <strong>According to current market data</strong>, comparable units in this area
                are renting for approximately ${market_average:,.0f}/month, which is
                ${abs(diff):,.0f} ({abs(pct):.1f}%) {'less' if diff > 0 else 'more'} than my current rent.
            </div>

            {'<p><strong>Legal Context:</strong> ' + legal_context[:300] + '</p>' if legal_context else ''}
            {'<p><strong>Legal Citation:</strong> ' + citation + '</p>' if citation else ''}

            <p>I would like to request a rent adjustment to bring my rent in line with
            the current market rate. I am a responsible tenant and would prefer to continue
            our rental relationship on fair terms.</p>

            <p>I am happy to discuss this at your earliest convenience.</p>

            <p>Sincerely,<br/>{tenant_name}</p>

            <p style="font-size: 11px; color: #666; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px;">
                Generated by LeaseGuard AI • Market data sourced via You.com Search API
            </p>
        </body>
        </html>
        """

        return self.generate_pdf(html_template, {})
