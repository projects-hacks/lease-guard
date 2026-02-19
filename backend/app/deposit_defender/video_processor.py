import cv2
import numpy as np
import tempfile
import os

class VideoProcessor:
    def __init__(self, scene_change_threshold=30.0):
        self.scene_change_threshold = scene_change_threshold

    def extract_key_frames(self, video_path: str) -> list[tuple[float, bytes]]:
        """
        Extracts key frames from the video.
        Returns a list of tuples: (timestamp_in_seconds, frame_jpeg_bytes)
        """
        cap = cv2.VideoCapture(video_path)
        frames = []
        prev_frame = None
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        
        # We want roughly 1 frame per second max, unless scene changes
        last_saved_time = -1.0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            timestamp = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
            
            is_key_frame = False
            
            # Check for scene change
            # Convert to grayscale for comparison
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            if prev_frame is not None:
                # Calculate absolute difference based on grayscale
                # Simple diff
                diff = cv2.absdiff(gray, prev_frame)
                mean_diff = np.mean(diff)
                
                if mean_diff > self.scene_change_threshold:
                     # Avoid too many frames too close together? 
                     # Let's say scene change must be at least 0.5s apart from last save
                     if timestamp - last_saved_time > 0.5:
                         is_key_frame = True
            
            prev_frame = gray

            # Also force 1 FPS
            if timestamp - last_saved_time >= 1.0:
                is_key_frame = True
            
            if is_key_frame:
                # Encode frame to JPEG
                success, buffer = cv2.imencode(".jpg", frame)
                if success:
                    frames.append((timestamp, buffer.tobytes()))
                    last_saved_time = timestamp
        
        cap.release()
        return frames

    def process_upload(self, file_bytes: bytes) -> list[tuple[float, bytes]]:
        """
        Helper to handle bytes -> temp file -> extract -> cleanup
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            temp_video.write(file_bytes)
            temp_video_path = temp_video.name
        
        try:
            return self.extract_key_frames(temp_video_path)
        finally:
            if os.path.exists(temp_video_path):
                os.remove(temp_video_path)
