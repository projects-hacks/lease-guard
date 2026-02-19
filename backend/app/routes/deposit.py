from fastapi import APIRouter, UploadFile, File, HTTPException
from app.deposit_defender.video_processor import VideoProcessor
from app.deposit_defender.defect_detector import DefectDetector
from app.deposit_defender.report_builder import ReportBuilder
import shutil
import tempfile
import os
import traceback

router = APIRouter()

@router.post("/deposit/upload")
async def upload_video(file: UploadFile = File(...)):
    # ...
    
    # 1. Read file
    try:
        file_bytes = await file.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")

    # 2. Extract Key Frames (OpenCV)
    processor = VideoProcessor()
    try:
        # Use temp file for OpenCV
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp:
            temp.write(file_bytes)
            temp_path = temp.name
        
        frames = processor.extract_key_frames(temp_path)
        os.remove(temp_path)
        
    except Exception as e:
        print(f"Video processing failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Video processing failed: {e}")

    # ...

    # 3. Detect Defects (GPT-4o Vision / Gemini)
    detector = DefectDetector()
    try:
        # Limit frames for hackathon demo to avoid timeout/cost
        # Pick max 5 frames for now
        MAX_FRAMES = 5
        if len(frames) > MAX_FRAMES:
             step = len(frames) // MAX_FRAMES
             frames = frames[::step][:MAX_FRAMES]

        defects = []
        for ts, frame_bytes in frames:
            result = detector.analyze_frame(frame_bytes, ts)
            if result:
                result["image_bytes"] = frame_bytes 
                defects.append(result)

    except Exception as e:
        print(f"AI Defect Detection failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Defect Detection failed: {e}")

    # 4. Build Report (Sanity)
    builder = ReportBuilder()
    try:
        report_id = builder.create_report(defects)
    except Exception as e:
        print(f"Report generation failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {e}")

    return {
        "status": "success",
        "reportId": report_id,
        "defectsFound": len(defects),
        "defects": [{k:v for k,v in d.items() if k!='image_bytes'} for d in defects]
    }
