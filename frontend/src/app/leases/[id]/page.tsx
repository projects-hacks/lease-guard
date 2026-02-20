"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getLeaseById, StoredLease } from "@/lib/leaseStore";
import { FileText, Mic, DollarSign, Wrench, ArrowLeft, ShieldAlert, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_MODULES = [
    {
        name: "Full Analysis",
        description: "View flagged clauses, risk breakdown, and legal citations.",
        icon: FileText,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        ringColor: "ring-blue-500/20",
        href: (id: string) => `/analysis/${id}`,
    },
    {
        name: "Voice Chat",
        description: "Ask questions about your lease using voice — AI answers instantly.",
        icon: Mic,
        color: "text-violet-400",
        bgColor: "bg-violet-500/10",
        ringColor: "ring-violet-500/20",
        href: (id: string) => `/chat?lease=${id}`,
    },
    {
        name: "Rent Analysis",
        description: "Compare your rent with live market data and check for rent control.",
        icon: DollarSign,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        ringColor: "ring-emerald-500/20",
        href: (_id: string) => `/rent`,
    },
    {
        name: "Maintenance Request",
        description: "Generate a professional repair request letter for your landlord.",
        icon: Wrench,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        ringColor: "ring-amber-500/20",
        href: (_id: string) => `/maintenance`,
    },
];

export default function LeaseDashboardPage() {
    const params = useParams();
    const id = params.id as string;
    const [lease, setLease] = useState<StoredLease | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const found = getLeaseById(id);
        setLease(found || null);
        setMounted(true);
    }, [id]);

    if (!mounted) {
        return (
            <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!lease) {
        return (
            <div className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center gap-6 p-6">
                <h1 className="text-2xl font-bold">Lease not found</h1>
                <p className="text-muted-foreground">This lease may have been removed from your browser.</p>
                <Link href="/leases" className="text-primary font-semibold hover:underline">
                    ← Back to My Leases
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-background p-6 lg:p-10 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[5%] left-[5%] w-[35%] h-[35%] bg-primary/10 blur-[140px] rounded-full pointer-events-none animate-float" />
            <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

            <div className="max-w-4xl mx-auto relative z-10 space-y-10">
                {/* Back Link */}
                <Link href="/leases" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors animate-fade-in-up">
                    <ArrowLeft className="w-4 h-4" />
                    My Leases
                </Link>

                {/* Header */}
                <div className="glass-card rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                        lease.riskScore > 70 ? "bg-red-500/15" :
                            lease.riskScore > 30 ? "bg-amber-500/15" :
                                "bg-emerald-500/15"
                    )}>
                        <ShieldAlert className={cn(
                            "w-8 h-8",
                            lease.riskScore > 70 ? "text-red-500" :
                                lease.riskScore > 30 ? "text-amber-500" :
                                    "text-emerald-500"
                        )} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate" title={lease.name}>
                            {lease.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground font-medium">
                            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/5">{lease.state}</span>
                            <span>•</span>
                            <span>{new Date(lease.uploadedAt).toLocaleDateString("en-US", {
                                month: "long", day: "numeric", year: "numeric"
                            })}</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                        <span className={cn(
                            "text-5xl font-black",
                            lease.riskScore > 70 ? "text-red-500" :
                                lease.riskScore > 30 ? "text-amber-500" :
                                    "text-emerald-500"
                        )}>
                            {lease.riskScore}
                        </span>
                        <span className="text-base text-muted-foreground font-bold">/100</span>
                    </div>
                </div>

                {/* Action Modules Grid */}
                <div>
                    <h2 className="text-xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>Quick Actions</h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {ACTION_MODULES.map((mod, idx) => {
                            const Icon = mod.icon;
                            return (
                                <Link
                                    key={mod.name}
                                    href={mod.href(id)}
                                    className="glass-card rounded-2xl p-6 flex items-start gap-5 group hover:scale-[1.02] transition-all animate-fade-in-up"
                                    style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
                                >
                                    <div className={cn("p-3 rounded-xl ring-1 shrink-0", mod.bgColor, mod.ringColor)}>
                                        <Icon className={cn("w-6 h-6", mod.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{mod.name}</h3>
                                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{mod.description}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
