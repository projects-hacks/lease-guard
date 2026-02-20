"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Props {
    reportId: string;
}

export default function DownloadReportButton({ reportId }: Props) {
    const [loading, setLoading] = useState(false);

    const handleDownload = () => {
        setLoading(true);
        // Navigate to the Next.js API route that serves the PDF inline.
        // iOS Safari will render the PDF natively with its built-in viewer,
        // where the user can tap Share → "Save to Files" to save it.
        window.open(`/api/download-report/${reportId}`, "_blank");

        // Reset loading state after a short delay since we can't reliably
        // detect when the native download finishes via window.location
        setTimeout(() => setLoading(false), 2000);
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
            {loading ? "Generating..." : "Download PDF"}
        </button>
    );
}
