from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.chat.voice_service import DeepgramService
from app.chat.bot import LegalChatBot
from app.sanity_client.client import SanityClient
import base64

router = APIRouter()

@router.post("/chat/voice")
async def voice_chat(
    file: UploadFile = File(...),
    lease_id: str = Form(None)
):
    """
    Voice-enabled legal Q&A with optional lease context.
    1. Transcribe audio (Deepgram Nova-3)
    2. If lease_id provided, fetch stored clauses from Sanity for context-aware answer
    3. Get legal answer (Gemini)
    4. Generate speech response (Deepgram Aura)
    """
    
    # 1. Read Audio
    try:
        audio_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading audio: {e}")

    # 2. Transcribe (STT)
    dg_service = DeepgramService()
    try:
        transcript = dg_service.transcribe_audio(audio_bytes, mimetype=file.content_type or "audio/webm")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT Failed: {e}")

    if not transcript:
        raise HTTPException(status_code=400, detail="Could not understand audio.")

    # 3. Get Answer (LLM) — with or without lease context
    bot = LegalChatBot()
    try:
        if lease_id:
            # Fetch the user's stored lease clauses from Sanity
            sanity = SanityClient()
            lease_data = sanity.get_analysis(lease_id)
            
            if lease_data:
                clauses = lease_data.get("extractedClauses", [])
                state = lease_data.get("state", "CA")
                answer = bot.get_lease_answer(transcript, clauses, state)
            else:
                answer = bot.get_legal_answer(transcript)
        else:
            answer = bot.get_legal_answer(transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Failed: {e}")

    # 4. Generate Speech (TTS)
    try:
        audio_response_bytes = dg_service.generate_speech(answer)
        audio_base64 = base64.b64encode(audio_response_bytes).decode("utf-8")
    except Exception as e:
        # Fallback to text-only if TTS fails
        print(f"TTS Failed: {e}")
        audio_base64 = None

    return {
        "transcript": transcript,
        "answer": answer,
        "audio": audio_base64,
        "lease_context": lease_id is not None
    }
