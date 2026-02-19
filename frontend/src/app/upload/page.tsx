"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadLease } from "@/lib/api";
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
            // specific Sanity ID is returned in data.analysisId
            router.push(`/analysis/${data.analysisId}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong during analysis.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">LeaseGuard</h1>
                    <p className="mt-2 text-muted-foreground">
                        Upload your lease to detect red flags and protect your rights.
                    </p>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* State Selector */}
                        <div className="space-y-2">
                            <label htmlFor="state" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Jurisdiction (State)
                            </label>
                            <select
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-muted/50",
                                file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"
                            )}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                {file ? (
                                    <>
                                        <FileText className="h-10 w-10 text-primary mb-2" />
                                        <span className="text-sm font-medium text-foreground">{file.name}</span>
                                        <span className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                        <span className="text-sm font-medium text-foreground">Click to upload or drag & drop</span>
                                        <span className="text-xs text-muted-foreground mt-1">PDF files only</span>
                                    </>
                                )}
                            </label>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing Lease...
                                </>
                            ) : (
                                "Analyze My Lease"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
