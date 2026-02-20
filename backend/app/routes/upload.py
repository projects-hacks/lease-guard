from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.documents.foxit_extract import FoxitClient
from app.lease_analysis.analyzer import LeaseAnalyzer
from app.sanity_client.client import SanityClient
import shutil
import os
import tempfile

router = APIRouter()

@router.post("/analyze")
async def analyze_lease(
    file: UploadFile = File(...),
    state: str = Form(...)  # State is required for legal context
):
    """
    Uploads a lease PDF, extracts text via Foxit, analyzes via Gemini, and saves to Sanity.
    """
    
    # 1. Save uploaded file temporarily (Foxit might need a file path or bytes)
    # FoxitClient.upload_pdf takes bytes, so we can read directly.
    try:
        file_content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # 2. Extract Text using Foxit
    foxit_client = FoxitClient()
    try:
        # We might need a filename for Foxit
        filename = file.filename or "lease.pdf"
        # In a real app, we'd probably upload to S3 here too for persistence, 
        # but for hackathon we'll just send to Foxit for extraction.
        # Note: The text extraction might take a few seconds. In a prod app this should be async/background task.
        # For hackathon demo, we'll keep it synchronous for simplicity if it's fast enough (<30s).
        # If Foxit is slow, we might hit timeout. 
        extracted_text = foxit_client.extract_text(file_content, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Foxit Extraction failed: {str(e)}")

    if not extracted_text:
        print("ERROR: Extracted text is empty or None")
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. It might be empty or image-only (if OCR not enabled).")
    
    # Debug print to see what we got
    print(f"Extracted Text Length: {len(extracted_text)}")
    print(f"Extracted Text Preview: {extracted_text[:500]}")

    # 3. Analyze with GPT-4o
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
