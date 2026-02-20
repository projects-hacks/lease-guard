import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle, Info, Mic, Volume2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CounterLetterButton from "@/components/CounterLetterButton";
import ReadAloudButton from "@/components/ReadAloudButton";

interface Props {
    params: Promise<{ id: string }>;
}

async function getAnalysis(id: string) {
    return client.fetch(
        `*[_type == "leaseAnalysis" && _id == $id][0]`,
        { id }
    );
}

export default async function AnalysisPage({ params }: Props) {
    const { id } = await params;
    const analysis = await getAnalysis(id);

    if (!analysis) {
        notFound();
    }

    const { extractedClauses, overallRiskScore, propertyAddress, summary } = analysis;

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-[10%] w-[30%] h-[30%] bg-primary/10 blur-[140px] rounded-full pointer-events-none animate-float" />
            <div className="absolute top-[40%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

            <div className="max-w-5xl mx-auto space-y-10 relative z-10 animate-fade-in-up">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Lease <span className="text-gradient-primary">Analysis Report</span></h1>
                        <p className="text-muted-foreground mt-2 font-medium text-lg">
                            {propertyAddress || "Unknown Property"}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/upload" className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors shrink-0">
                            Analyze another lease
                        </Link>
                        <Link
                            href={`/chat?lease=${id}`}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white hover:shadow-lg hover:shadow-primary/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
                        >
                            <Mic className="w-4 h-4" />
                            Ask Your Lease
                        </Link>
                        <ReadAloudButton analysisId={id} label="Listen" text="" />
                    </div>
                </div>

                {/* Score Card */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none group-hover:opacity-100 transition-opacity opacity-50" />
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Overall Risk Score</h3>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className={cn(
                                "text-6xl font-black drop-shadow-md",
                                overallRiskScore > 70 ? "text-red-500" : overallRiskScore > 30 ? "text-amber-500" : "text-emerald-500"
                            )}>
                                {overallRiskScore}
                            </span>
                            <span className="text-lg text-muted-foreground font-semibold">/ 100</span>
                        </div>
                        <p className="text-sm text-foreground/70 mt-4 leading-relaxed font-medium">
                            Higher score indicates more aggressive or risky clauses.
                        </p>
                    </div>

                    {/* Summary Card */}
                    {summary && (
                        <div className="glass-card rounded-3xl p-8 md:col-span-2 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none group-hover:opacity-100 transition-opacity opacity-50" />
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">AI Summary</h3>
                            <p className="text-[15px] leading-relaxed text-foreground/90">{summary}</p>
                        </div>
                    )}
                </div>

                {/* Clauses List */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight">Flagged Clauses</h2>
                    <div className="grid gap-6">
                        {extractedClauses?.map((clause: any, idx: number) => (
                            <div
                                key={idx}
                                className={cn(
                                    "glass-card rounded-2xl p-6 md:p-8 transition-all hover:scale-[1.01] hover:shadow-xl relative overflow-hidden group border-none",
                                    clause.riskLevel === "red" ? "ring-1 ring-red-500/30" :
                                        clause.riskLevel === "yellow" ? "ring-1 ring-amber-500/30" :
                                            "ring-1 ring-emerald-500/30"
                                )}
                            >
                                {/* Left-side colored indicator bar */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1.5",
                                    clause.riskLevel === "red" ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                                        clause.riskLevel === "yellow" ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
                                            "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                )} />

                                <div className="flex flex-col md:flex-row items-start justify-between gap-6 pl-2">
                                    <div className="flex-1 space-y-5 w-full">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={cn(
                                                "inline-flex items-center rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-widest",
                                                clause.riskLevel === "red" ? "bg-red-500/20 text-red-400" :
                                                    clause.riskLevel === "yellow" ? "bg-amber-500/20 text-amber-500" :
                                                        "bg-emerald-500/20 text-emerald-400"
                                            )}>
                                                {clause.riskLevel}
                                            </span>
                                            <h3 className="font-bold text-xl capitalize text-foreground">{clause.clauseType.replace(/_/g, ' ')}</h3>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-full" />
                                            <p className="text-muted-foreground text-[15px] italic leading-relaxed pl-4 pr-4 py-1">
                                                &quot;{clause.originalText}&quot;
                                            </p>
                                        </div>

                                        <div className="space-y-3 bg-background/40 p-5 rounded-xl border border-white/5">
                                            <div className="flex items-start gap-3 text-[15px]">
                                                <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                                                <span className="text-foreground/90 leading-relaxed font-medium">{clause.explanation}</span>
                                            </div>

                                            {clause.citation && (
                                                <div className="flex items-start gap-3 text-[15px] pt-2">
                                                    <span className="font-bold min-w-20 text-muted-foreground uppercase tracking-wider text-xs mt-1">Legal Ref:</span>
                                                    <span className="text-primary font-semibold">{clause.citation}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {clause.riskLevel === 'red' && (
                                        <div className="hidden md:block shrink-0">
                                            <CounterLetterButton clause={clause} />
                                        </div>
                                    )}
                                </div>

                                {clause.riskLevel === 'red' && (
                                    <div className="mt-6 md:hidden">
                                        <CounterLetterButton clause={clause} variant="full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
