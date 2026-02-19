from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from app.documents.foxit_docgen import FoxitDocGenClient
import requests
import urllib.parse

router = APIRouter()

class CounterLetterRequest(BaseModel):
    tenantName: str
    landlordName: str
    clause: dict
    state: str

@router.post("/generate/counter-letter")
async def generate_counter_letter(request: CounterLetterRequest):
    client = FoxitDocGenClient()
    try:
        pdf_bytes = client.create_counter_letter(
            request.tenantName,
            request.landlordName,
            request.clause,
            request.state
        )
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=counter_letter.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/generate/report/{report_id}")
async def generate_condition_report_pdf(report_id: str):
    from app.sanity_client.client import SanityClient
    sanity = SanityClient()
    
    # 1. Fetch Report Data
    query = f'*[_type == "conditionReport" && _id == "{report_id}"][0]{{..., defects[]{{..., screenshot{{asset->{{url}}}}}}}}'
    try:
        # We need to implement a generic fetch in SanityClient or use raw requests
        # Using the SanityClient instance to fetch (assuming we add a fetch method or use internal)
        # For speed, let's just use requests here or add method to SanityClient
        # Actually SanityClient doesn't have a fetch method exposed yet.
        # Let's add a quick fetch helper here or use the one in client.py if exists.
        # client.py only has save_analysis. Let's hack a quick fetch here or better, add to SanityClient.
        
        # Quick fetch
        encoded_query = urllib.parse.quote(query)
        url = f"https://{sanity.project_id}.api.sanity.io/v2024-02-18/data/query/{sanity.dataset}?query={encoded_query}"
        headers = {"Authorization": f"Bearer {sanity.token}"}
        
        res = requests.get(url, headers=headers)
        res.raise_for_status()
        data = res.json().get("result")
        
        if not data:
            raise HTTPException(status_code=404, detail="Report not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sanity fetch failed: {e}")

    # 2. Generate PDF
    client = FoxitDocGenClient()
    try:
        pdf_bytes = client.create_condition_report(data)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=condition_report_{report_id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {e}")
