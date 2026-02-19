"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Check, Loader2, Play, Square, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    audioUrl?: string;
}

export default function VoiceChat() {
    const [isRecording, setIsRecording] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm LeaseGuard AI. Ask me anything about your lease or tenant rights." }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            messages.forEach(m => {
                if (m.audioUrl) URL.revokeObjectURL(m.audioUrl);
            });
        };
    }, []);

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
                await handleSendAudio(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Microphone access is required.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSendAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);

        // Optimistic user message (placeholder)
        // Actually we don't know the text yet. Wait for response.

        const formData = new FormData();
        formData.append("file", audioBlob, "voice_query.webm");

        try {
            const response = await fetch("/api/v1/chat/voice", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Voice processing failed");

            const data = await response.json();

            // Update Conversation
            setMessages(prev => [
                ...prev,
                { role: "user", content: data.transcript },
                { role: "assistant", content: data.answer, audioUrl: data.audio ? `data:audio/mp3;base64,${data.audio}` : undefined }
            ]);

            // Auto-play response
            if (data.audio) {
                const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
                audio.play().catch(e => console.error("Auto-play blocked:", e));
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-card border rounded-xl shadow-lg overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, idx) => (
                    <div key={idx} className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                            m.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"
                        )}>
                            <p>{m.content}</p>
                            {m.audioUrl && (
                                <button
                                    onClick={() => new Audio(m.audioUrl).play()}
                                    className="mt-2 text-xs flex items-center gap-1 opacity-70 hover:opacity-100"
                                >
                                    <Play className="w-3 h-3" /> Replay Voice
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start w-full">
                        <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                <div className="flex justify-center">
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        // For touch devices
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md",
                            isRecording ? "bg-red-500 scale-110 ring-4 ring-red-500/30" : "bg-primary hover:bg-primary/90",
                            isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        )}
                        disabled={isProcessing}
                    >
                        {isRecording ? (
                            <Square className="w-6 h-6 text-white fill-current" />
                        ) : (
                            <Mic className="w-8 h-8 text-white" />
                        )}
                    </button>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    {isRecording ? "Release to Send" : "Hold to Speak"}
                </p>
            </div>
        </div>
    );
}
