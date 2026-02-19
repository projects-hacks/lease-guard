from fastapi import APIRouter, UploadFile, File, HTTPException
from app.chat.voice_service import DeepgramService
from app.chat.bot import LegalChatBot
import base64
import tempfile
import os

router = APIRouter()

@router.post("/chat/voice")
async def voice_chat(file: UploadFile = File(...)):
    """
    Voice-enabled legal Q&A.
    1. Transcribe audio (Deepgram Nova-2)
    2. Get legal answer (GPT-4o)
    3. Generate speech response (Deepgram Aura)
    """
    
    # 1. Read Audio
    try:
        audio_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading audio: {e}")

    # 2. Transcribe (STT)
    dg_service = DeepgramService()
    try:
        # Save to temp file if SDK requires it, but buffer usually works.
        # My implementation supports buffer.
        # Note: mimetype might need detection or fixed webm/wav from frontend
        transcript = dg_service.transcribe_audio(audio_bytes, mimetype=file.content_type or "audio/webm")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT Failed: {e}")

    if not transcript:
        raise HTTPException(status_code=400, detail="Could not understand audio.")

    # 3. Get Answer (LLM)
    bot = LegalChatBot()
    try:
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
        "audio": audio_base64
    }
