"""
Enhanced Deepgram Voice Service — uses Nova-3 for STT and Aura-2 for TTS.
Supports pre-recorded audio, text-to-speech, and read-aloud functionality.
"""
from deepgram import DeepgramClient
from app.config import settings
import tempfile
import os


class DeepgramService:
    def __init__(self):
        if not settings.DEEPGRAM_API_KEY:
            raise ValueError("Deepgram API Key not set")
        self.client = DeepgramClient(api_key=settings.DEEPGRAM_API_KEY)

    def transcribe_audio(self, audio_bytes: bytes, mimetype: str = "audio/webm") -> str:
        """
        Transcribes audio bytes to text using Deepgram Nova-3 model.
        Best for: pre-recorded voice notes, uploaded audio files.
        """
        try:
            response = self.client.listen.v1.media.transcribe_file(
                request=audio_bytes,
                model="nova-3",
                smart_format=True,
                punctuate=True,
                paragraphs=True,
            )
            transcript = response.results.channels[0].alternatives[0].transcript
            return transcript
            
        except Exception as e:
            print(f"Deepgram STT Error: {e}")
            raise e

    def transcribe_with_intelligence(self, audio_bytes: bytes, mimetype: str = "audio/webm") -> dict:
        """
        Transcribes audio with Deepgram Audio Intelligence features:
        - Summarization
        - Topic Detection
        - Intent Recognition
        Best for: maintenance requests where we need structured data.
        """
        try:
            response = self.client.listen.v1.media.transcribe_file(
                request=audio_bytes,
                model="nova-3",
                smart_format=True,
                punctuate=True,
                summarize="v2",
                topics=True,
                intents=True,
            )
            
            channel = response.results.channels[0].alternatives[0]
            
            result = {
                "transcript": channel.transcript,
                "summary": "",
                "topics": [],
                "intents": [],
            }
            
            # Extract intelligence features
            if hasattr(response.results, "summary") and response.results.summary:
                result["summary"] = getattr(response.results.summary, "short", "")
            if hasattr(response.results, "topics") and response.results.topics:
                for seg in getattr(response.results.topics, "segments", []):
                    for topic in getattr(seg, "topics", []):
                        result["topics"].append(getattr(topic, "topic", ""))
            if hasattr(response.results, "intents") and response.results.intents:
                for seg in getattr(response.results.intents, "segments", []):
                    for intent in getattr(seg, "intents", []):
                        result["intents"].append(getattr(intent, "intent", ""))
            
            return result
            
        except Exception as e:
            print(f"Deepgram Intelligence Error: {e}")
            # Fallback to basic transcription
            return {
                "transcript": self.transcribe_audio(audio_bytes, mimetype),
                "summary": "",
                "topics": [],
                "intents": [],
            }

    def generate_speech(self, text: str) -> bytes:
        """
        Generates speech (TTS) from text using Deepgram Aura-2 model.
        Returns audio bytes (mp3).
        Model: aura-2-thalia-en (natural female voice, latest quality).
        """
        try:
            # Generate speech streaming iterator using Aura-2
            generator = self.client.speak.v1.audio.generate(
                text=text,
                model="aura-2-thalia-en",
                encoding="mp3"
            )
            
            # Read bytes into memory
            audio_bytes = b"".join(chunk for chunk in generator)
            return audio_bytes

        except Exception as e:
            print(f"Deepgram TTS Error: {e}")
            raise e

    def read_aloud(self, text: str, max_chars: int = 5000) -> bytes:
        """
        Read aloud any text content (analysis results, counter-letters, rights summaries).
        Truncates long text to keep TTS reasonable.
        """
        # Truncate if too long for TTS
        if len(text) > max_chars:
            text = text[:max_chars] + "... Content has been shortened for audio playback."
        
        return self.generate_speech(text)
