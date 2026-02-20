"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeases, removeLease, StoredLease } from "@/lib/leaseStore";
import { Plus, Trash2, ArrowRight, FolderOpen, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyLeasesPage() {
    const [leases, setLeases] = useState<StoredLease[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setLeases(getLeases());
        setMounted(true);
    }, []);

    const handleDelete = (id: string) => {
        removeLease(id);
        setLeases(getLeases());
    };

    if (!mounted) {
        return (
            <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-background p-6 lg:p-10 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-[10%] w-[40%] h-[40%] bg-primary/10 blur-[140px] rounded-full pointer-events-none animate-float" />
            <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

            <div className="max-w-5xl mx-auto relative z-10 space-y-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            My <span className="text-gradient-primary">Leases</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium mt-2">
                            {leases.length > 0
                                ? `${leases.length} lease${leases.length !== 1 ? "s" : ""} analyzed`
                                : "Upload your first lease to get started"}
                        </p>
                    </div>
                    <Link
                        href="/upload"
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        Upload New Lease
                    </Link>
                </div>

                {/* Lease Grid */}
                {leases.length === 0 ? (
                    <div className="glass-card rounded-3xl p-16 text-center animate-fade-in-up">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <FolderOpen className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">No leases yet</h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Upload a lease PDF and our AI will analyze it for red flags, risky clauses, and legal violations.
                        </p>
                        <Link
                            href="/upload"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                        >
                            <Plus className="w-5 h-5" />
                            Analyze My First Lease
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {leases.map((lease, idx) => (
                            <div
                                key={lease.id}
                                className="glass-card rounded-2xl p-6 flex flex-col justify-between gap-5 group hover:scale-[1.02] transition-all animate-fade-in-up relative overflow-hidden"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                {/* Left colored border */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1.5",
                                    lease.riskScore > 70 ? "bg-red-500" :
                                        lease.riskScore > 30 ? "bg-amber-500" :
                                            "bg-emerald-500"
                                )} />

                                <div className="pl-2">
                                    {/* Title Row */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg truncate" title={lease.name}>{lease.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                                {new Date(lease.uploadedAt).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric"
                                                })} • {lease.state}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(lease.id)}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                            title="Remove lease"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Risk Score */}
                                    <div className="flex items-baseline gap-2 mb-5">
                                        <ShieldAlert className={cn(
                                            "w-5 h-5",
                                            lease.riskScore > 70 ? "text-red-500" :
                                                lease.riskScore > 30 ? "text-amber-500" :
                                                    "text-emerald-500"
                                        )} />
                                        <span className={cn(
                                            "text-3xl font-black",
                                            lease.riskScore > 70 ? "text-red-500" :
                                                lease.riskScore > 30 ? "text-amber-500" :
                                                    "text-emerald-500"
                                        )}>
                                            {lease.riskScore}
                                        </span>
                                        <span className="text-sm text-muted-foreground font-semibold">/ 100 risk</span>
                                    </div>
                                </div>

                                {/* Action Link */}
                                <Link
                                    href={`/leases/${lease.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-bold transition-all group-hover:border-primary/30"
                                >
                                    Open Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
