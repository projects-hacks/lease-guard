from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import Response
from app.chat.voice_service import DeepgramService
from app.voice_qa.maintenance import MaintenanceDocumenter
from app.documents.foxit_docgen import FoxitDocGenClient
from app.sanity_client.client import SanityClient
import base64

router = APIRouter()


@router.post("/maintenance/report")
async def create_maintenance_request(
    file: UploadFile = File(...),
    tenant_name: str = Form("Tenant"),
    landlord_name: str = Form("Property Manager"),
    property_address: str = Form(""),
):
    """
    Voice-first maintenance request documenter.
    1. Transcribe audio with Deepgram Nova-3 + Audio Intelligence (topics, intents, summary)
    2. Structure into formal maintenance request via Gemini
    3. Generate professional PDF via Foxit
    4. Return structured data + PDF download
    """
    # 1. Read audio
    try:
        audio_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading audio: {e}")

    # 2. Transcribe with Audio Intelligence
    dg = DeepgramService()
    try:
        intelligence = dg.transcribe_with_intelligence(
            audio_bytes, mimetype=file.content_type or "audio/webm"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    transcript = intelligence.get("transcript", "")
    if not transcript:
        raise HTTPException(status_code=400, detail="Could not understand audio.")

    # 3. Structure into maintenance request
    documenter = MaintenanceDocumenter()
    request_data = documenter.structure_request(
        transcript,
        topics=intelligence.get("topics", []),
        intents=intelligence.get("intents", [])
    )

    # 4. Generate HTML for PDF
    html = documenter.generate_request_html(
        request_data,
        tenant_name=tenant_name,
        landlord_name=landlord_name,
        property_address=property_address
    )

    # 5. Generate PDF via Foxit
    foxit = FoxitDocGenClient()
    try:
        pdf_bytes = foxit.generate_pdf(html, {})
        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
    except Exception as e:
        print(f"PDF generation failed, returning data without PDF: {e}")
        pdf_base64 = None

    # 6. Generate TTS summary for accessibility
    try:
        summary_text = f"Maintenance request created. {request_data['title']}. Urgency: {request_data['urgency']}. {request_data['description']}"
        audio_response = dg.generate_speech(summary_text)
        audio_base64 = base64.b64encode(audio_response).decode("utf-8")
    except Exception as e:
        print(f"TTS failed: {e}")
        audio_base64 = None

    return {
        "request": request_data,
        "transcript": transcript,
        "intelligence": {
            "summary": intelligence.get("summary", ""),
            "topics": intelligence.get("topics", []),
            "intents": intelligence.get("intents", []),
        },
        "pdf": pdf_base64,
        "audio_summary": audio_base64,
    }


@router.post("/tts/read-aloud")
async def read_aloud(text: str = Form(...)):
    """
    Text-to-Speech endpoint using Deepgram Aura-2.
    Converts any text to spoken audio (mp3).
    Use cases: read analysis results, counter-letters, rights summaries.
    """
    dg = DeepgramService()
    try:
        audio_bytes = dg.read_aloud(text)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=read_aloud.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")


@router.post("/tts/read-analysis/{analysis_id}")
async def read_analysis_aloud(analysis_id: str):
    """
    Reads a lease analysis result aloud using Deepgram Aura-2 TTS.
    Summarizes clauses and provides voice-first accessibility.
    """
    sanity = SanityClient()
    try:
        analysis = sanity.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetch failed: {e}")

    # Build readable text from analysis
    clauses = analysis.get("extractedClauses", [])
    risk_score = analysis.get("overallRiskScore", 0)
    summary = analysis.get("summary", "")

    text_parts = [
        f"Lease Analysis Report. Overall risk score: {risk_score} out of 100.",
    ]
    
    if summary:
        text_parts.append(summary)
    
    red_flags = [c for c in clauses if c.get("riskLevel") == "red"]
    yellow_flags = [c for c in clauses if c.get("riskLevel") == "yellow"]
    green_flags = [c for c in clauses if c.get("riskLevel") == "green"]
    
    text_parts.append(f"Found {len(red_flags)} red flags, {len(yellow_flags)} warnings, and {len(green_flags)} safe clauses.")
    
    if red_flags:
        text_parts.append("Red flags require immediate attention:")
        for i, clause in enumerate(red_flags[:5], 1):
            clause_type = clause.get("clauseType", "unknown").replace("_", " ")
            explanation = clause.get("explanation", "")
            text_parts.append(f"Red flag {i}: {clause_type}. {explanation}")
    
    full_text = " ".join(text_parts)
    
    dg = DeepgramService()
    try:
        audio_bytes = dg.read_aloud(full_text)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=analysis_audio.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")
