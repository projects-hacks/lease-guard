import requests
import base64
import uuid
from app.sanity_client.client import SanityClient
from app.config import settings

class ReportBuilder:
    def __init__(self):
        self.sanity = SanityClient()

    def upload_image_asset(self, image_bytes: bytes) -> str:
        """
        Uploads an image to Sanity asset pipeline and returns the asset ID.
        """
        url = f"https://{self.sanity.project_id}.api.sanity.io/v2024-02-18/assets/images/{self.sanity.dataset}"
        headers = {
            "Authorization": f"Bearer {self.sanity.token}",
            "Content-Type": "image/jpeg"
        }
        
        response = requests.post(url, headers=headers, data=image_bytes)
        response.raise_for_status()
        return response.json()["document"]["_id"]

    def create_report(self, defects: list[dict], video_url: str = None) -> str:
        """
        Creates a Condition Report in Sanity.
        """
        # Upload screenshots for each defect
        processed_defects = []
        for d in defects:
            asset_ref = None
            if "image_bytes" in d:
                try:
                    asset_id = self.upload_image_asset(d.pop("image_bytes"))
                    asset_ref = {
                        "_type": "image",
                        "asset": {"_ref": asset_id}
                    }
                except Exception as e:
                    print(f"Failed to upload asset: {e}")
            
            processed_defects.append({
                "_type": "defect", # Actually mapped to object in schema array
                "_key": str(d.get("timestamp")), # Unique key
                "type": d.get("type", "other"),
                "location": d.get("location"),
                "description": d.get("description"),
                "severity": d.get("severity"),
                "timestamp": d.get("timestamp"),
                "confidence": d.get("confidence"),
                "screenshot": asset_ref # Store as image type
            })

        report_id = str(uuid.uuid4())
        doc = {
            "_id": report_id,
            "_type": "conditionReport",
            "inspectionDate": "2026-02-18T12:00:00Z", # Should be now()
            "videoUrl": video_url,
            "defects": processed_defects
        }
        
        # Reuse Sanity client save logic or extend it
        # For now, custom mutation here since schema differs
        mutations = {"mutations": [{"create": doc}]}
        headers = {
            "Authorization": f"Bearer {self.sanity.token}",
            "Content-Type": "application/json"
        }
        url = f"https://{self.sanity.project_id}.api.sanity.io/v2024-02-18/data/mutate/{self.sanity.dataset}"
        
        response = requests.post(url, headers=headers, json=mutations)
        response.raise_for_status()
        return report_id
