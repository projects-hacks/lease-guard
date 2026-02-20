"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, FileDown, Volume2, RefreshCw, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MaintenancePage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [tenantName, setTenantName] = useState("");
    const [landlordName, setLandlordName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                await handleSubmit(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Microphone access is required to report maintenance issues.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", audioBlob, "maintenance_report.webm");
        formData.append("tenant_name", tenantName || "Tenant");
        formData.append("landlord_name", landlordName || "Property Manager");
        formData.append("property_address", propertyAddress || "");

        try {
            const res = await fetch("/api/v1/maintenance/report", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Processing failed");
            const data = await res.json();
            setResult(data);

            // Auto-play audio summary if available
            if (data.audio_summary) {
                const audio = new Audio(`data:audio/mp3;base64,${data.audio_summary}`);
                audio.play().catch(() => { });
            }
        } catch (err) {
            console.error(err);
            alert("Failed to process. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadPdf = () => {
        if (!result?.pdf) return;
        const byteArray = Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `maintenance_request_${result.request?.issue_category || "report"}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const reset = () => {
        setResult(null);
        chunksRef.current = [];
    };

    const urgencyColor = {
        emergency: "bg-red-100 text-red-800 border-red-300",
        urgent: "bg-yellow-100 text-yellow-800 border-yellow-300",
        routine: "bg-green-100 text-green-800 border-green-300",
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                        <Wrench className="w-8 h-8" />
                        Maintenance Reporter
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Describe your maintenance issue by voice — we&apos;ll create a formal request letter.
                    </p>
                </div>

                {/* Input Fields */}
                {!result && (
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Your Name</label>
                                <input
                                    type="text"
                                    className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="John Doe"
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Landlord / Manager</label>
                                <input
                                    type="text"
                                    className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Property Manager"
                                    value={landlordName}
                                    onChange={(e) => setLandlordName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Property Address</label>
                            <input
                                type="text"
                                className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="123 Main St, Apt 4B"
                                value={propertyAddress}
                                onChange={(e) => setPropertyAddress(e.target.value)}
                            />
                        </div>

                        {/* Voice Recorder */}
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                disabled={isProcessing}
                                className={cn(
                                    "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                                    isRecording ? "bg-red-500 scale-110 ring-4 ring-red-500/30" : "bg-primary hover:bg-primary/90",
                                    isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                )}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : isRecording ? (
                                    <Square className="w-8 h-8 text-white fill-current" />
                                ) : (
                                    <Mic className="w-10 h-10 text-white" />
                                )}
                            </button>
                            <p className="text-sm text-muted-foreground">
                                {isProcessing ? "Processing your request..." :
                                    isRecording ? "Recording... Release to submit" :
                                        "Hold to describe your issue"}
                            </p>
                            <p className="text-xs text-muted-foreground max-w-sm text-center">
                                Example: &quot;There&apos;s a leak under the kitchen sink. Water is pooling on the floor and it started yesterday morning.&quot;
                            </p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        {/* Request Card */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex items-start justify-between">
                                <h2 className="text-xl font-bold">{result.request?.title}</h2>
                                <div className="flex gap-2">
                                    <span className={cn(
                                        "text-xs px-3 py-1 rounded-full font-semibold uppercase border",
                                        urgencyColor[result.request?.urgency as keyof typeof urgencyColor] || urgencyColor.routine
                                    )}>
                                        {result.request?.urgency}
                                    </span>
                                    <span className="text-xs px-3 py-1 rounded-full bg-muted capitalize">
                                        {result.request?.issue_category?.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            {result.request?.safety_concern && (
                                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm font-medium">
                                    ⚠️ Safety Concern — Requires Immediate Attention
                                </div>
                            )}

                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-medium text-muted-foreground">Description</span>
                                    <p className="mt-1">{result.request?.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium text-muted-foreground">Location</span>
                                        <p className="mt-1">{result.request?.location}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Requested Action</span>
                                        <p className="mt-1">{result.request?.requested_action}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Original Transcript */}
                            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground italic border">
                                &quot;{result.transcript}&quot;
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            {result.pdf && (
                                <button
                                    onClick={downloadPdf}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md font-medium transition-colors"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Download PDF
                                </button>
                            )}
                            {result.audio_summary && (
                                <button
                                    onClick={() => {
                                        const audio = new Audio(`data:audio/mp3;base64,${result.audio_summary}`);
                                        audio.play();
                                    }}
                                    className="flex items-center gap-2 border border-input bg-background hover:bg-accent px-4 h-10 rounded-md text-sm font-medium transition-colors"
                                >
                                    <Volume2 className="w-4 h-4" />
                                    Read Aloud
                                </button>
                            )}
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 border border-input bg-background hover:bg-accent px-4 h-10 rounded-md text-sm font-medium transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                New
                            </button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground">
                            Powered by Deepgram Nova-3 (STT) & Aura-2 (TTS) • Foxit (PDF)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
