import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CounterLetterButton from "@/components/CounterLetterButton";

// Sanity Client for fetching results
import { createClient } from "next-sanity";

// We need a simplified client here purely for fetching in component
// In production, move to lib/sanity.ts
const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kvnf809l",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-02-18",
    useCdn: false, // Ensure fresh data
});

interface Props {
    params: Promise<{ id: string }>;
}

async function getAnalysis(id: string) {
    return sanityClient.fetch(
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

    const { extractedClauses, overallRiskScore, propertyAddress } = analysis;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lease Analysis Report</h1>
                        <p className="text-muted-foreground mt-1">
                            {propertyAddress || "Unknown Property"}
                        </p>
                    </div>
                    <Link href="/upload" className="text-primary hover:underline text-sm md:text-base">
                        Analyze another lease
                    </Link>
                </div>

                {/* Score Card */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-card rounded-xl border p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Overall Risk Score</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className={cn(
                                "text-4xl font-bold",
                                overallRiskScore > 70 ? "text-destructive" : overallRiskScore > 30 ? "text-yellow-500" : "text-green-500"
                            )}>
                                {overallRiskScore}
                            </span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Higher score indicates more aggressive or risky clauses.
                        </p>
                    </div>
                </div>

                {/* Clauses List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Flagged Clauses</h2>
                    <div className="grid gap-4">
                        {extractedClauses?.map((clause: any, idx: number) => (
                            <div
                                key={idx}
                                className={cn(
                                    "bg-card border rounded-lg p-6 shadow-sm transition-all hover:shadow-md",
                                    clause.riskLevel === "red" ? "border-l-4 border-l-destructive" :
                                        clause.riskLevel === "yellow" ? "border-l-4 border-l-yellow-500" :
                                            "border-l-4 border-l-green-500"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                                clause.riskLevel === "red" ? "bg-destructive/10 text-destructive" :
                                                    clause.riskLevel === "yellow" ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-green-100 text-green-800"
                                            )}>
                                                {clause.riskLevel.toUpperCase()}
                                            </span>
                                            <h3 className="font-semibold text-lg capitalize">{clause.clauseType.replace('_', ' ')}</h3>
                                        </div>

                                        <p className="text-muted-foreground text-sm italic mb-4 bg-muted/50 p-3 rounded-md border">
                                            "{clause.originalText}"
                                        </p>

                                        <div className="space-y-2">
                                            <div className="flex gap-2 text-sm">
                                                <Info className="h-4 w-4 text-primary mt-0.5" />
                                                <span className="text-foreground/90">{clause.explanation}</span>
                                            </div>

                                            {clause.citation && (
                                                <div className="flex gap-2 text-sm">
                                                    <span className="font-medium min-w-16 text-muted-foreground">Legal Ref:</span>
                                                    <span className="text-primary">{clause.citation}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {clause.riskLevel === 'red' && (
                                        <div className="hidden md:block">
                                            <CounterLetterButton clause={clause} />
                                        </div>
                                    )}
                                </div>
                                {clause.riskLevel === 'red' && (
                                    <div className="mt-4 md:hidden">
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
