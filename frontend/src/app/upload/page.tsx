"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadLease } from "@/lib/api";
import { saveLeaseToStore } from "@/lib/leaseStore";
import { Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATES = [
    "CA", "NY", "TX", "FL", "IL", "WA", "MA", "CO", "NJ", "OR"
];

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [state, setState] = useState("CA");
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a lease PDF to upload.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const data = await uploadLease(file, state);
            // Save lease metadata to localStorage for the dashboard
            saveLeaseToStore({
                id: data.analysisId,
                name: file.name.replace(/\.pdf$/i, ""),
                state,
                riskScore: data.overallRiskScore ?? 0,
                uploadedAt: new Date().toISOString(),
            });
            router.push(`/leases/${data.analysisId}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong during analysis.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[0%] right-[0%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-float" />
            <div className="absolute bottom-[0%] left-[0%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        <span className="text-foreground">Analyze </span>
                        <span className="text-gradient-primary">Lease</span>
                    </h1>
                    <p className="mt-3 text-lg text-muted-foreground font-medium">
                        Upload your contract to detect red flags and protect your tenant rights.
                    </p>
                </div>

                <div className="glass-card p-8 rounded-3xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* State Selector */}
                        <div className="space-y-2">
                            <label htmlFor="state" className="text-sm font-semibold text-foreground/90">
                                Jurisdiction (State)
                            </label>
                            <select
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full h-11 px-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                            >
                                {STATES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* File Upload Area */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={cn(
                                "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
                                file
                                    ? "border-primary/50 bg-primary/10 shadow-inner"
                                    : "border-white/10 bg-background/30 hover:bg-white/5 hover:border-white/20"
                            )}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center min-h-[120px]">
                                {file ? (
                                    <div className="animate-fade-in-up">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                                            <FileText className="h-8 w-8 text-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground block truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-xs text-primary font-medium mt-1 inline-block bg-primary/10 px-2 py-0.5 rounded-full">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                ) : (
                                    <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground block">Click to upload or drag & drop</span>
                                        <span className="text-xs text-muted-foreground mt-1 block">PDF documents only</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-fade-in-up">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25 mt-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    Analyzing Lease...
                                </>
                            ) : (
                                "Analyze AI Shield"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
