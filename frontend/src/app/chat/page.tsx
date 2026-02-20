"use client";

import { useSearchParams } from "next/navigation";
import VoiceChat from "@/components/VoiceChat";
import { Suspense } from "react";

function ChatContent() {
    const searchParams = useSearchParams();
    const leaseId = searchParams.get("lease") || undefined;

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary">LeaseGuard Voice Assistant</h1>
                <p className="text-muted-foreground mt-2">
                    {leaseId
                        ? "Ask questions about YOUR lease — I have your clauses loaded."
                        : "Ask questions about your lease, tenant rights, or local laws."}
                </p>
            </div>

            <VoiceChat leaseId={leaseId} />

            <div className="mt-8 text-center text-xs text-muted-foreground max-w-sm">
                <p>Powered by Deepgram Nova-3 (Speech-to-Text & Aura TTS) and Gemini.</p>
                <p className="mt-1 text-yellow-600/80">Not legal advice. Verify with a professional.</p>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
