"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Props {
    reportId: string;
}

// Detect iOS / Safari which blocks programmatic blob downloads
const isIOS = () =>
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

export default function DownloadReportButton({ reportId }: Props) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/generate/report/${reportId}`);
            if (!res.ok) throw new Error("Failed to generate PDF");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            if (isIOS()) {
                // iOS Safari: programmatic clicks are blocked — open PDF in browser tab
                // The user can then use the Share Sheet to save to Files
                window.open(url, "_blank");
                // Cleanup after short delay
                setTimeout(() => URL.revokeObjectURL(url), 5000);
            } else {
                // Desktop / Android Chrome: programmatic download works fine
                const a = document.createElement("a");
                a.href = url;
                a.download = `condition-report-${reportId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error("Download failed:", err);
            alert("Could not download the report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-all"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            {loading ? "Generating..." : isIOS() ? "Open PDF" : "Download PDF"}
        </button>
    );
}
