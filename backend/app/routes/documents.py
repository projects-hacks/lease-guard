from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from app.documents.foxit_docgen import FoxitDocGenClient
from app.sanity_client.client import SanityClient
from app.law_engine.youcom_legal import YouComLegalSearch

router = APIRouter()

class CounterLetterRequest(BaseModel):
    tenantName: str
    landlordName: str
    clause: dict
    state: str

class NegotiationLetterRequest(BaseModel):
    tenantName: str
    landlordName: str
    currentRent: float
    marketAverage: float
    state: str

@router.post("/generate/counter-letter")
async def generate_counter_letter(request: CounterLetterRequest):
    """
    Generates a counter-letter PDF for a specific clause.
    Uses You.com to verify legal citations before generating.
    """
    # 1. Verify legal reference with You.com
    legal_search = YouComLegalSearch()
    try:
        verification = legal_search.verify_red_flag(
            request.state,
            request.clause.get("clauseType", ""),
            request.clause.get("originalText", "")
        )
        # Enhance clause with real legal sources
        if verification.get("sources"):
            request.clause["verified_sources"] = verification["sources"]
        if verification.get("legal_analysis"):
            request.clause["legal_analysis"] = verification["legal_analysis"]
    except Exception as e:
        print(f"You.com verification skipped: {e}")

    # 2. Generate PDF
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
    """
    Fetches condition report data from Sanity and generates a PDF.
    """
    sanity = SanityClient()
    
    try:
        data = sanity.get_condition_report(report_id)
        if not data:
            raise HTTPException(status_code=404, detail="Report not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sanity fetch failed: {e}")

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

@router.post("/generate/negotiation-letter")
async def generate_negotiation_letter(request: NegotiationLetterRequest):
    """
    Generates a rent negotiation letter PDF based on market data analysis.
    """
    # Get rent laws for the area
    legal_search = YouComLegalSearch()
    try:
        rent_laws = legal_search.search_statute(request.state, "rent_increase", "")
        legal_context = rent_laws.get("explanation", "")
        citation = rent_laws.get("citation", "")
    except Exception:
        legal_context = ""
        citation = ""

    client = FoxitDocGenClient()
    try:
        pdf_bytes = client.create_negotiation_letter(
            request.tenantName,
            request.landlordName,
            request.currentRent,
            request.marketAverage,
            request.state,
            legal_context,
            citation
        )
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=negotiation_letter.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
