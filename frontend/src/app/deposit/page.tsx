"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoRecorder from "@/components/VideoRecorder";
import { Loader2, UploadCloud, Video } from "lucide-react";

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

            const response = await fetch("/api/v1/deposit/upload", {
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
        <div className="min-h-screen bg-background p-6 flex flex-col items-center">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Deposit Defender</h1>
                    <p className="mt-2 text-muted-foreground">
                        Record a walkthrough of your apartment. AI will identify defects and generate a condition report.
                    </p>
                </div>

                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <VideoRecorder onRecordingComplete={setBlob} />
                </div>

                {blob && !isProcessing && (
                    <div className="flex justify-center">
                        <button
                            onClick={handleUpload}
                            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium text-lg transition-colors"
                        >
                            <UploadCloud className="w-6 h-6" />
                            Analyze & Generate Report
                        </button>
                    </div>
                )}

                {isProcessing && (
                    <div className="flex flex-col items-center space-y-4 py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-primary font-medium">{processingStage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
