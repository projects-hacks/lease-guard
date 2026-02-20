"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, FileDown, Volume2, RefreshCw, Wrench, MapPin, User, Building2 } from "lucide-react";
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

    const toggleRecording = async () => {
        if (isProcessing) return;

        if (isRecording) {
            // Tap again to stop
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
            return;
        }

        // Tap to start
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

    const handleSubmit = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", audioBlob, "maintenance_report.webm");
        formData.append("tenant_name", tenantName || "Tenant");
        formData.append("landlord_name", landlordName || "Property Manager");
        formData.append("property_address", propertyAddress || "");

        try {
            const res = await fetch(`/api/v1/maintenance/report`, {
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

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-background p-4 sm:p-6 lg:p-10 relative overflow-hidden pb-28 md:pb-10">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-[5%] w-[35%] h-[35%] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none animate-float" />
            <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 relative z-10">
                <div className="text-center animate-fade-in-up">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-3">
                        <div className="p-2.5 bg-cyan-500/10 rounded-xl ring-1 ring-cyan-500/20">
                            <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                        </div>
                        <span>Maintenance <span className="text-gradient-primary">Reporter</span></span>
                    </h1>
                    <p className="text-muted-foreground mt-3 text-sm sm:text-base px-2">
                        Describe your maintenance issue by voice — we&apos;ll create a formal request letter.
                    </p>
                </div>

                {/* Input Fields */}
                {!result && (
                    <div className="glass-card rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-11 px-4 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm placeholder:text-muted-foreground"
                                    placeholder="John Doe"
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    Landlord / Manager
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-11 px-4 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm placeholder:text-muted-foreground"
                                    placeholder="Property Manager"
                                    value={landlordName}
                                    onChange={(e) => setLandlordName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                Property Address
                            </label>
                            <input
                                type="text"
                                className="w-full h-11 px-4 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm placeholder:text-muted-foreground"
                                placeholder="123 Main St, Apt 4B, San Francisco, CA"
                                value={propertyAddress}
                                onChange={(e) => setPropertyAddress(e.target.value)}
                            />
                        </div>

                        {/* Voice Recorder */}
                        <div className="flex flex-col items-center gap-4 pt-4 sm:pt-6">
                            <button
                                onClick={toggleRecording}
                                disabled={isProcessing}
                                className={cn(
                                    "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all shadow-lg",
                                    isRecording
                                        ? "bg-red-500 scale-110 ring-4 ring-red-500/30 shadow-red-500/30"
                                        : "bg-gradient-to-br from-primary to-indigo-600 hover:shadow-primary/30 hover:scale-105",
                                    isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"
                                )}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : isRecording ? (
                                    <Square className="w-8 h-8 text-white fill-current" />
                                ) : (
                                    <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                )}
                            </button>
                            <p className="text-sm text-muted-foreground font-medium">
                                {isProcessing ? "Processing your request..." :
                                    isRecording ? "Recording... Tap to submit" :
                                        "Tap to describe your issue"}
                            </p>
                            <p className="text-xs text-muted-foreground/70 max-w-sm text-center leading-relaxed">
                                Example: &quot;There&apos;s a leak under the kitchen sink. Water is pooling on the floor and it started yesterday morning.&quot;
                            </p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-5 sm:space-y-6 animate-fade-in-up">
                        {/* Request Card */}
                        <div className="glass-card rounded-2xl p-5 sm:p-8 space-y-5">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                <h2 className="text-lg sm:text-xl font-bold">{result.request?.title}</h2>
                                <div className="flex gap-2 flex-wrap">
                                    <span className={cn(
                                        "text-[11px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider",
                                        result.request?.urgency === "emergency" ? "bg-red-500/20 text-red-400" :
                                            result.request?.urgency === "urgent" ? "bg-amber-500/20 text-amber-400" :
                                                "bg-emerald-500/20 text-emerald-400"
                                    )}>
                                        {result.request?.urgency}
                                    </span>
                                    <span className="text-[11px] px-3 py-1 rounded-lg bg-white/5 text-foreground/70 capitalize font-medium">
                                        {result.request?.issue_category?.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            {result.request?.safety_concern && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                    ⚠️ Safety Concern — Requires Immediate Attention
                                </div>
                            )}

                            <div className="space-y-4 text-sm">
                                <div className="bg-background/40 p-4 rounded-xl border border-white/5">
                                    <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Description</span>
                                    <p className="mt-2 text-foreground/90 leading-relaxed">{result.request?.description}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-background/40 p-4 rounded-xl border border-white/5">
                                        <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Location</span>
                                        <p className="mt-2 text-foreground/90">{result.request?.location}</p>
                                    </div>
                                    <div className="bg-background/40 p-4 rounded-xl border border-white/5">
                                        <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Requested Action</span>
                                        <p className="mt-2 text-foreground/90">{result.request?.requested_action}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Original Transcript */}
                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-full" />
                                <p className="text-sm text-muted-foreground italic leading-relaxed pl-4">
                                    &quot;{result.transcript}&quot;
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {result.pdf && (
                                <button
                                    onClick={downloadPdf}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white h-11 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
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
                                    className="flex items-center justify-center gap-2 glass px-5 h-11 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                                >
                                    <Volume2 className="w-4 h-4" />
                                    Read Aloud
                                </button>
                            )}
                            <button
                                onClick={reset}
                                className="flex items-center justify-center gap-2 glass px-5 h-11 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                            >
                                <RefreshCw className="w-4 h-4" />
                                New
                            </button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground/60 font-medium">
                            Powered by Deepgram Nova-3 (STT) & Aura-2 (TTS) • Foxit (PDF)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
