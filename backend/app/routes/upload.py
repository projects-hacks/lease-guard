from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.documents.foxit_extract import FoxitClient
from app.lease_analysis.analyzer import LeaseAnalyzer
from app.sanity_client.client import SanityClient
from app.config import settings
from google import genai
from google.genai import types
import shutil
import os
import tempfile

router = APIRouter()


def _validate_is_lease(text: str) -> bool:
    """Quick Gemini check to verify the document is a genuine lease/rental agreement."""
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"""Analyze the following document text and determine if it is a residential lease, rental agreement, or tenancy contract.

Reply with ONLY "yes" or "no" — nothing else.

DOCUMENT TEXT (first 2000 chars):
\"\"\"
{text[:2000]}
\"\"\"""",
            config=types.GenerateContentConfig(
                temperature=0.0,
            )
        )
        answer = response.text.strip().lower()
        return answer.startswith("yes")
    except Exception as e:
        print(f"Lease validation check failed, allowing through: {e}")
        return True  # Fail open — don't block if validation itself errors


@router.post("/analyze")
async def analyze_lease(
    file: UploadFile = File(...),
    state: str = Form(...)  # State is required for legal context
):
    """
    Uploads a lease PDF, extracts text via Foxit, validates it's a real lease,
    analyzes via Gemini, and saves to Sanity.
    """
    
    # 1. Read file
    try:
        file_content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # 2. Extract Text using Foxit
    foxit_client = FoxitClient()
    try:
        filename = file.filename or "lease.pdf"
        extracted_text = foxit_client.extract_text(file_content, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Foxit Extraction failed: {str(e)}")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. It might be empty or image-only.")
    
    print(f"Extracted Text Length: {len(extracted_text)}")

    # 3. Validate this is actually a lease document
    if not _validate_is_lease(extracted_text):
        raise HTTPException(
            status_code=400,
            detail="This document does not appear to be a residential lease or rental agreement. Please upload a valid lease PDF."
        )

    # 4. Analyze with Gemini
    analyzer = LeaseAnalyzer()
    try:
        analysis_result = analyzer.analyze_lease(extracted_text, state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

    # 4. Save to Sanity
    sanity_client = SanityClient()
    try:
        user_id = "demo_user"  # TODO: auth integration
        doc_id = sanity_client.save_analysis(analysis_result, user_id, filename, state=state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Saving to Sanity failed: {str(e)}")

    return {
        "status": "success",
        "analysisId": doc_id,
        "results": analysis_result
    }
