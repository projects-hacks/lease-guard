import VoiceChat from "@/components/VoiceChat";

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary">LeaseGuard Voice Assistant</h1>
                <p className="text-muted-foreground mt-2">
                    Ask questions about your lease, tenant rights, or local laws.
                </p>
            </div>

            <VoiceChat />

            <div className="mt-8 text-center text-xs text-muted-foreground max-w-sm">
                <p>Powered by Deepgram (Speech-to-Text & Aura TTS) and GPT-4o.</p>
                <p className="mt-1 text-yellow-600/80">Not legal advice. Verify with a professional.</p>
            </div>
        </div>
    );
}
