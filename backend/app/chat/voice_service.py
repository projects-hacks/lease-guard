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
        self.client = DeepgramClient(settings.DEEPGRAM_API_KEY)

    def transcribe_audio(self, audio_bytes: bytes, mimetype: str = "audio/webm") -> str:
        """
        Transcribes audio bytes to text using Deepgram Nova-3 model.
        Best for: pre-recorded voice notes, uploaded audio files.
        """
        try:
            payload = {"buffer": audio_bytes}
            
            options = {
                "model": "nova-3",
                "smart_format": True,
                "mimetype": mimetype,
                "punctuate": True,
                "paragraphs": True,
            }
            
            response = self.client.listen.prerecorded.v("1").transcribe_file(payload, options)
            transcript = response["results"]["channels"][0]["alternatives"][0]["transcript"]
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
            payload = {"buffer": audio_bytes}
            
            options = {
                "model": "nova-3",
                "smart_format": True,
                "mimetype": mimetype,
                "punctuate": True,
                "summarize": "v2",
                "topics": True,
                "intents": True,
            }
            
            response = self.client.listen.prerecorded.v("1").transcribe_file(payload, options)
            
            channel = response["results"]["channels"][0]["alternatives"][0]
            
            result = {
                "transcript": channel.get("transcript", ""),
                "summary": "",
                "topics": [],
                "intents": [],
            }
            
            # Extract intelligence features
            if "results" in response:
                results = response["results"]
                if "summary" in results:
                    result["summary"] = results["summary"].get("short", "")
                if "topics" in results:
                    topics_data = results["topics"]
                    if "segments" in topics_data:
                        for seg in topics_data["segments"]:
                            for topic in seg.get("topics", []):
                                result["topics"].append(topic.get("topic", ""))
                if "intents" in results:
                    intents_data = results["intents"]
                    if "segments" in intents_data:
                        for seg in intents_data["segments"]:
                            for intent in seg.get("intents", []):
                                result["intents"].append(intent.get("intent", ""))
            
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
            options = {
                "text": text,
            }
            
            # Use unique temp file to avoid race conditions
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
                tmp_path = tmp.name
            
            # Save to unique temp file using Aura-2
            self.client.speak.v("1").save(
                tmp_path, options,
                {"model": "aura-2-thalia-en", "encoding": "mp3", "container": "mp3"}
            )
            
            # Read back bytes
            with open(tmp_path, "rb") as f:
                audio_bytes = f.read()
            
            # Cleanup
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
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
