from google import genai
from google.genai import types
from app.config import settings
import json
import PIL.Image
import io
import traceback

class DefectDetector:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
             raise ValueError("Gemini API Key is missing")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-3.1-pro-preview"

    def analyze_frame(self, frame_bytes: bytes, timestamp: float) -> dict | None:
        """
        Sends a frame to Gemini 3 Flash Preview to detect defects.
        Returns defect dict if found, else None.
        """
        prompt = """
        Analyze this image from an apartment move-in video.
        Identify if there are any VISIBLE DEFECTS (scratches, holes, stains, water damage, mold, broken items).
        If NO defects are visible, return {"found": false}.
        If defects are found, describe them and return JSON:
        {
            "found": true,
            "type": "scratch" | "crack" | "dstain" | "hole" | "water_damage" | "mold" | "other",
            "location": "string (e.g. 'wall', 'floor', 'ceiling')",
            "description": "short description",
            "severity": "minor" | "moderate" | "major",
            "confidence": 0.0-1.0
        }
        """

        try:
            # Convert bytes to PIL Image (Gemini requirement)
            image = PIL.Image.open(io.BytesIO(frame_bytes))
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=[prompt, image],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            result = json.loads(response.text)
            
            # Handle list response (Gemini sometimes returns [{}])
            if isinstance(result, list):
                if result:
                    result = result[0]
                else:
                    return None

            if result.get("found"):
                # Add timestamp info
                result["timestamp"] = timestamp
                return result
            return None
        except Exception as e:
            print(f"Frame analysis failed: {e}")
            traceback.print_exc()
            return None

    def analyze_frames(self, frames: list[tuple[float, bytes]]) -> list[dict]:
        """
        Analyze a list of frames and aggregate defects.
        """
        defects = []
        # For hackathon speed/cost, maybe limit max frames to analyze?
        # Let's say max 10 frames spread out? Or analyze all but allow parallel?
        # Sequential for now.
        
        # Optimization: Don't analyze every single key frame if we have too many.
        # Pick max 10 frames evenly distributed if count > 10
        PROCESS_LIMIT = 10
        frames_to_process = frames
        if len(frames) > PROCESS_LIMIT:
            step = len(frames) // PROCESS_LIMIT
            frames_to_process = frames[::step][:PROCESS_LIMIT]

        for timestamp, frame_bytes in frames_to_process:
            defect = self.analyze_frame(frame_bytes, timestamp)
            if defect:
                # Add the image bytes to the result so we can upload it later/display it
                defect["image_bytes"] = frame_bytes 
                defects.append(defect)
        
        return defects
