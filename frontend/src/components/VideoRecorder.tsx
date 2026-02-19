"use client";

import { useState, useRef, useEffect } from "react";
import { Video, StopCircle, RefreshCw, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    onRecordingComplete: (blob: Blob) => void;
}

export default function VideoRecorder({ onRecordingComplete }: Props) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/mp4" });
                setRecordedBlob(blob);
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                onRecordingComplete(blob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                if (videoPreviewRef.current) {
                    videoPreviewRef.current.srcObject = null;
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing media devices:", err);
            alert("Could not access camera/microphone. Please allow permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const resetRecording = () => {
        setRecordedBlob(null);
        setVideoUrl(null);
        chunksRef.current = [];
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative aspect-video w-full max-w-2xl bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {!isRecording && !videoUrl && (
                    <div className="text-muted-foreground flex flex-col items-center">
                        <Video className="w-12 h-12 mb-2" />
                        <p>Camera Preview</p>
                    </div>
                )}

                {/* Live Preview */}
                <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    className={cn("w-full h-full object-cover absolute inset-0", !isRecording && !videoUrl ? "hidden" : isRecording ? "block" : "hidden")}
                />

                {/* Recorded Playback */}
                {videoUrl && !isRecording && (
                    <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain absolute inset-0"
                    />
                )}
            </div>

            <div className="flex gap-4">
                {!isRecording && !recordedBlob && (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                    >
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        Start Recording
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-full font-medium transition-colors"
                    >
                        <StopCircle className="w-5 h-5" />
                        Stop Recording
                    </button>
                )}

                {recordedBlob && (
                    <button
                        onClick={resetRecording}
                        className="flex items-center gap-2 border border-input bg-background hover:bg-accent text-foreground px-6 py-2 rounded-full font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retake
                    </button>
                )}
            </div>

            {isRecording && (
                <p className="text-red-500 font-medium animate-pulse">Recording...</p>
            )}
        </div>
    );
}
