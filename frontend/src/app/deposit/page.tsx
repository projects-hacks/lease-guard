"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoRecorder from "@/components/VideoRecorder";
import { Loader2, Camera, CheckCircle2 } from "lucide-react";

export default function DepositPage() {
    const [blob, setBlob] = useState<Blob | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStage, setProcessingStage] = useState<string>("");
    const router = useRouter();

    const handleUpload = async () => {
        if (!blob) return;

        setIsProcessing(true);
        setProcessingStage("Uploading video...");

        try {
            const formData = new FormData();
            formData.append("file", blob, "move_in_inspection.mp4");

            setProcessingStage("Analyzing frames (OpenCV + GPT-4o)... this may take a minute.");

            const response = await fetch(`/api/v1/deposit/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Processing failed");
            }

            const data = await response.json();
            router.push(`/deposit/report/${data.reportId}`);

        } catch (error) {
            console.error(error);
            setProcessingStage("Error occurred. Please try again.");
            setTimeout(() => setIsProcessing(false), 3000);
        }
    };

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-background p-4 sm:p-6 lg:p-10 relative overflow-hidden pb-28 md:pb-10">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-[5%] w-[35%] h-[35%] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none animate-float" />
            <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

            <div className="max-w-2xl mx-auto relative z-10 space-y-6 sm:space-y-8">
                <div className="text-center animate-fade-in-up">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-3">
                        <div className="p-2.5 bg-orange-500/10 rounded-xl ring-1 ring-orange-500/20">
                            <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                        </div>
                        <span>Deposit <span className="text-gradient-primary">Defender</span></span>
                    </h1>
                    <p className="text-muted-foreground mt-3 text-sm sm:text-base px-2">
                        Record a video walkthrough of your unit. AI identifies defects to protect your deposit.
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                    <VideoRecorder onRecordingComplete={setBlob} />

                    {blob && !isProcessing && (
                        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
                            <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Video recorded successfully
                            </p>
                            <button
                                onClick={handleUpload}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                            >
                                <Camera className="w-5 h-5" />
                                Analyze Video
                            </button>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="flex flex-col items-center gap-3 py-4">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground font-medium animate-pulse">{processingStage}</p>
                        </div>
                    )}
                </div>

                <div className="text-center text-xs text-muted-foreground/60 font-medium">
                    <p>Powered by OpenCV, Gemini Vision & Foxit PDF.</p>
                </div>
            </div>
        </div>
    );
}
