"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, Play, Square, Volume2, Link2, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    audioUrl?: string;
}

interface Props {
    leaseId?: string;
}

export default function VoiceChat({ leaseId }: Props) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hintDismissed, setHintDismissed] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: leaseId
                ? "Hi! I have your lease loaded. Ask me anything — like \"Can I have a pet?\" or \"What's my late fee?\""
                : "Hi! I'm LeaseGuard AI. Ask me anything about tenant rights or lease agreements."
        }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        return () => {
            messages.forEach(m => {
                if (m.audioUrl) URL.revokeObjectURL(m.audioUrl);
            });
        };
    }, []);

    const playAudio = (src: string): Promise<void> => {
        return new Promise((resolve) => {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current.src = "";
            }
            const audio = new Audio(src);
            currentAudioRef.current = audio;
            setIsPlaying(true);
            audio.onended = () => { setIsPlaying(false); resolve(); };
            audio.onerror = () => { setIsPlaying(false); resolve(); };
            audio.play().catch(() => { setIsPlaying(false); resolve(); });
        });
    };

    const startRecording = async () => {
        if (isPlaying || isProcessing) return;
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
        const formData = new FormData();
        formData.append("file", audioBlob, "voice_query.webm");
        if (leaseId) formData.append("lease_id", leaseId);

        try {
            const res = await fetch(`/api/v1/chat/voice?lease_id=${leaseId || ""}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Voice processing failed");
            const data = await res.json();
            const audioSrc = data.audio ? `data:audio/mp3;base64,${data.audio}` : undefined;

            setMessages(prev => [
                ...prev,
                { role: "user", content: data.transcript },
                { role: "assistant", content: data.answer, audioUrl: audioSrc }
            ]);

            // Wait for audio to finish before user can record again
            if (audioSrc) {
                await playAudio(audioSrc);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const buttonDisabled = isProcessing || isPlaying;
    const statusLabel = isProcessing
        ? "Thinking..."
        : isPlaying
            ? "AI is speaking — please wait"
            : isRecording
                ? "Release to send"
                : "Hold to speak";

    return (
        <div className="flex flex-col h-[600px] w-full max-w-md mx-auto glass-card rounded-3xl overflow-hidden animate-fade-in-up">
            {leaseId && (
                <div className="px-5 py-3 bg-primary/20 border-b border-primary/30 flex items-center gap-3 text-sm text-primary font-bold shadow-inner">
                    <Link2 className="w-4 h-4" />
                    Lease loaded — answers are based on YOUR lease clauses
                </div>
            )}

            {!leaseId && !hintDismissed && (
                <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-sm shadow-inner">
                    <div className="flex items-center gap-2 text-amber-500">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>
                            For personalized answers,{" "}
                            <Link href="/upload" className="font-bold underline underline-offset-4 hover:text-amber-400">
                                upload your lease first
                            </Link>
                        </span>
                    </div>
                    <button
                        onClick={() => setHintDismissed(true)}
                        className="text-amber-600 hover:text-amber-400 font-bold shrink-0 p-1 rounded-full hover:bg-amber-500/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {messages.map((m, idx) => (
                    <div key={idx} className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[85%] rounded-2xl px-5 py-3 text-[15px] shadow-sm leading-relaxed",
                            m.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-sm font-medium"
                                : "bg-white/10 border border-white/5 text-foreground rounded-bl-sm"
                        )}>
                            <p>{m.content}</p>
                            {m.audioUrl && (
                                <button
                                    onClick={() => playAudio(m.audioUrl!)}
                                    className="mt-3 text-xs flex items-center gap-1.5 opacity-80 hover:opacity-100 font-bold bg-black/20 px-3 py-1.5 rounded-full w-fit transition-colors"
                                >
                                    <Play className="w-3.5 h-3.5" /> Replay Voice
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start w-full animate-fade-in-up block">
                        <div className="bg-white/10 border border-white/5 rounded-2xl rounded-bl-sm px-5 py-3 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">Analyzing request...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-white/5 bg-background/50 backdrop-blur-md">
                <div className="flex justify-center relative">
                    {isRecording && (
                        <div className="absolute inset-0 m-auto w-20 h-20 bg-red-500/30 rounded-full animate-ping pointer-events-none" />
                    )}
                    {isPlaying && (
                        <div className="absolute inset-0 m-auto w-20 h-20 bg-primary/20 rounded-full animate-ping pointer-events-none" />
                    )}

                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={cn(
                            "relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border border-white/10",
                            isRecording
                                ? "bg-red-500 scale-110 shadow-red-500/40 border-red-400"
                                : isPlaying
                                    ? "bg-primary/40 scale-100 cursor-not-allowed"
                                    : "bg-gradient-to-br from-primary to-indigo-600 hover:opacity-90 hover:scale-105 shadow-primary/30",
                            buttonDisabled && !isRecording ? "opacity-50 cursor-not-allowed" : ""
                        )}
                        disabled={buttonDisabled}
                    >
                        {isRecording ? (
                            <Square className="w-6 h-6 text-white fill-current animate-pulse" />
                        ) : isPlaying ? (
                            <Volume2 className="w-7 h-7 text-white animate-pulse" />
                        ) : (
                            <Mic className="w-7 h-7 text-white" />
                        )}
                    </button>
                </div>
                <p className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-5">
                    {statusLabel}
                </p>
            </div>
        </div>
    );
}
