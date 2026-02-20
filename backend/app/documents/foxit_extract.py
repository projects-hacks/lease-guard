import requests
import time
import os
from app.config import settings

import base64

class FoxitClient:
    def __init__(self):
        self.base_url = settings.FOXIT_API_BASE_URL
        self.client_id = settings.FOXIT_CLIENT_ID
        self.client_secret = settings.FOXIT_CLIENT_SECRET
        self.token = self._get_access_token()
        
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            # "Content-Type": "application/json" # Do not set specific content type globally if uploading files
        }

    def _get_access_token(self) -> str:
        # Try different token endpoints 
        endpoints = [
            f"{self.base_url}/api/v1/oauth2/token",
            "https://na1.foxitesign.foxit.com/api/oauth2/access_token", # Common OAuth
            f"{self.base_url}/oauth/token"
        ]
        
        payload = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": "pdf-services"
        }
        
        for url in endpoints:
            try:
                # Try sending as data (form-urlencoded) first, then json
                response = requests.post(url, data=payload)
                if response.ok:
                    print(f"Foxit Auth Success at {url}")
                    return response.json().get("access_token")
            except Exception as e:
                print(f"Auth attempt failed at {url}: {e}")
                
        print("Foxit Auth Failed on all endpoints.")
        return "mock_token"

    def upload_pdf(self, file_content: bytes, filename: str) -> str:
        """
        Uploads a PDF file and returns the document ID.
        """
        # Corrected URL path based on documentation
        url = f"{self.base_url}/pdf-services/api/documents/upload" 
        
        # Copy headers but remove Content-Type if present so requests can set boundary
        headers = self.headers.copy()
        if "Content-Type" in headers:
            del headers["Content-Type"]
        
        files = {'file': (filename, file_content, 'application/pdf')}
        
        try:
            response = requests.post(url, headers=headers, files=files)
            response.raise_for_status()
            return response.json().get("documentId")
        except Exception as e:
            if hasattr(e, 'response') and e.response is not None:
                print(f"Foxit Upload Error Body: {e.response.text}")
            print(f"Foxit Upload Error: {e}")
            # Mock for development if API fails
            return "mock_doc_id"

    def start_extraction(self, document_id: str) -> str:
        """
        Starts the text extraction process and returns a task ID.
        """
        # Confirmed endpoint from documentation
        url = f"{self.base_url}/pdf-services/api/documents/convert/pdf-to-text"
        
        payload = {
            "documentId": document_id
        }
        
        try:
            print(f"Starting extraction at: {url}")
            response = requests.post(url, headers=self.headers, json=payload)
            if response.ok:
                print(f"Extraction started successfully.")
                return response.json().get("taskId")
            else:
                print(f"Extraction Start Failed: {response.status_code} - {response.text}")
                raise Exception(f"Foxit API Error: {response.text}")
        except Exception as e:
            print(f"Start Extraction Error: {e}")
            return "mock_task_id" # Return mock to trigger fallback in extract_text

    def poll_status(self, task_id: str, max_retries=60, interval=2) -> str:
        """
        Polls the extraction task status and returns the extracted text when complete.
        """
        # Confirmed endpoint from documentation
        url = f"{self.base_url}/pdf-services/api/tasks/{task_id}"
        
        for _ in range(max_retries):
            try:
                response = requests.get(url, headers=self.headers)
            
                if not response.ok:
                     print(f"Polling Status Failed: {response.status_code} - {response.text}")
                     time.sleep(interval)
                     continue

                data = response.json()
                status = data.get("status")
                print(f"Polling Task {task_id}: {status}") 
                print(f"Extraction Completed Data: {data}")
                
                if status == "COMPLETED" or status == "SUCCEEDED": # Handle potential variations
                    if "downloadUrl" in data:
                        print(f"Downloading result from: {data['downloadUrl']}")
                        text_resp = requests.get(data["downloadUrl"])
                        return text_resp.text
                    elif "resultDocumentId" in data:
                        # Construct download URL for result document
                        result_doc_id = data["resultDocumentId"]
                        download_url = f"{self.base_url}/pdf-services/api/documents/{result_doc_id}/download"
                        print(f"Downloading result from document ID: {result_doc_id}")
                        # Provide headers (auth) for this request
                        text_resp = requests.get(download_url, headers=self.headers)
                        return text_resp.text 
                    
                    # Sometimes result might be directly in 'text' or check other fields
                    return data.get("text", "") # Fallback if direct text
                elif status == "FAILED":
                    raise Exception(f"PDF Extraction failed: {data}")
                
                time.sleep(interval)
            except Exception as e:
                print(f"Polling Status Error: {e}")
                # Do NOT mock. We need to know if it fails.
                time.sleep(interval)
                continue
            
        raise Exception("PDF Extraction timed out")

    def extract_text_local(self, file_content: bytes) -> str:
        """
        Fallback extraction using local pypdf library.
        """
        try:
            import io
            from pypdf import PdfReader
            
            print("Falling back to local pypdf extraction...")
            reader = PdfReader(io.BytesIO(file_content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Local Extraction Failed: {e}")
            return ""

    def extract_text(self, file_content: bytes, filename: str) -> str:
        """
        Convenience method to handle the full extraction flow.
        """
        try:
            doc_id = self.upload_pdf(file_content, filename)
            if doc_id and doc_id != "mock_doc_id":
                task_id = self.start_extraction(doc_id)
                if task_id and task_id != "mock_task_id":
                    return self.poll_status(task_id)
            
            # If API flow failed or mocked, fall back
            raise Exception("Foxit API flow incomplete")
            
        except Exception as e:
            print(f"Foxit Cloud Extraction failed: {e}")
            return self.extract_text_local(file_content)
