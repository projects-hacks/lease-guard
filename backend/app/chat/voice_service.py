from deepgram import DeepgramClient
from app.config import settings
import io
import os

class DeepgramService:
    def __init__(self):
        if not settings.DEEPGRAM_API_KEY:
            raise ValueError("Deepgram API Key not set")
        self.client = DeepgramClient(settings.DEEPGRAM_API_KEY)

    def transcribe_audio(self, audio_bytes: bytes, mimetype: str = "audio/webm") -> str:
        """
        Transcribes audio bytes to text using Deepgram Nova-2 model.
        """
        try:
            # Deepgram SDK expects a source dictionary or buffer
            payload = {"buffer": audio_bytes}
            
            options = {
                "model": "nova-2",
                "smart_format": True,
                "mimetype": mimetype
            }
            
            response = self.client.listen.prerecorded.v("1").transcribe_file(payload, options)
            transcript = response["results"]["channels"][0]["alternatives"][0]["transcript"]
            return transcript
            
        except Exception as e:
            print(f"Deepgram STT Error: {e}")
            raise e

    def generate_speech(self, text: str) -> bytes:
        """
        Generates speech (TTS) from text using Deepgram Aura model.
        Returns audio bytes (mp3).
        """
        try:
            options = {
                "text": text,
            }
            
            # Use speak.v("1").save to save to file, or raw response?
            # The SDK supports saving directly. To verify if we can get bytes.
            filename = "temp_tts.mp3"
            
            # Save to file
            self.client.speak.v("1").save(filename, options, {"model": "aura-asteria-en", "encoding": "mp3", "container": "mp3"})
            
            # Read back bytes
            with open(filename, "rb") as f:
                audio_bytes = f.read()
            
            # Cleanup
            if os.path.exists(filename):
                os.remove(filename)
                
            return audio_bytes

        except Exception as e:
            print(f"Deepgram TTS Error: {e}")
            # Fallback mock for testing if no credits
            # return b"mock_audio"
            raise e
