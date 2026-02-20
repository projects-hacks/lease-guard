"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    text: string;
    className?: string;
    label?: string;
    /** If provided, uses the pre-built analysis read-aloud endpoint instead of raw text */
    analysisId?: string;
}

export default function ReadAloudButton({ text, className, label = "Read Aloud", analysisId }: Props) {
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);

    const handleReadAloud = async () => {
        setLoading(true);
        try {
            let audioBlob: Blob;

            if (analysisId) {
                // Use the pre-built analysis TTS endpoint
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tts/read-analysis/${analysisId}`, {
                    method: "POST",
                });
                if (!res.ok) throw new Error("TTS failed");
                audioBlob = await res.blob();
            } else {
                // Use raw text TTS
                const formData = new FormData();
                formData.append("text", text);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tts/read-aloud", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("TTS failed");
                audioBlob = await res.blob();
            }

            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);

            audio.onplay = () => setPlaying(true);
            audio.onended = () => {
                setPlaying(false);
                URL.revokeObjectURL(url);
            };
            audio.onerror = () => {
                setPlaying(false);
                URL.revokeObjectURL(url);
            };

            audio.play();
        } catch (err) {
            console.error("Read aloud failed:", err);
            alert("Could not generate audio. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleReadAloud}
            disabled={loading || playing}
            className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
                "rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                "h-9 px-3",
                "disabled:pointer-events-none disabled:opacity-50",
                playing && "ring-2 ring-primary ring-offset-1",
                className
            )}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Volume2 className={cn("w-4 h-4", playing && "animate-pulse text-primary")} />
            )}
            {playing ? "Playing..." : label}
        </button>
    );
}
