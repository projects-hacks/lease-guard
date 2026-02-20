"use client";

import { useState } from "react";
import { DollarSign, MapPin, Search, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RentAnalysis {
    is_rent_control_likely: boolean;
    average_market_rent: string;
    market_summary: string;
    recommendation: string;
}

export default function RentCalculator() {
    const [city, setCity] = useState("");
    const [currentRent, setCurrentRent] = useState("");
    const [bedrooms, setBedrooms] = useState("1");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<RentAnalysis | null>(null);
    const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
    const [letterPdf, setLetterPdf] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city || !currentRent) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        setLetterPdf(null);

        try {
            const res = await fetch(`/api/v1/rent/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    city,
                    current_rent: parseFloat(currentRent),
                    bedrooms: parseInt(bedrooms)
                })
            });

            if (!res.ok) throw new Error("Failed to analyze");
            const data = await res.json();
            setAnalysis(data);
        } catch (error) {
            console.error(error);
            alert("Could not pull market data. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateLetter = async () => {
        if (!analysis || !city) return;
        setIsGeneratingLetter(true);

        try {
            const tenantName = prompt("Enter your name:", "John Doe") || "John Doe";
            const landlordName = prompt("Enter landlord name:", "Landlord Inc.") || "Landlord Inc.";

            const res = await fetch(`/api/v1/generate/negotiation-letter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenant_name: tenantName,
                    landlord_name: landlordName,
                    property_address: city,
                    current_rent: currentRent,
                    market_average_rent: analysis.average_market_rent
                })
            });

            if (!res.ok) throw new Error("Failed to generate letter");
            const data = await res.json();
            setLetterPdf(data.pdf);
        } catch (error) {
            console.error(error);
            alert("Failed to generate letter.");
        } finally {
            setIsGeneratingLetter(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            {/* Input Form */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl ring-1 ring-emerald-500/20">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Market Analysis</h2>
                        <p className="text-sm text-muted-foreground">Compare your rent with real-time web data.</p>
                    </div>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/90">City / Neighborhood</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="e.g. San Francisco, CA"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full pl-9 h-11 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/90">Your Rent /mo</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="number"
                                    placeholder="2500"
                                    value={currentRent}
                                    onChange={(e) => setCurrentRent(e.target.value)}
                                    className="w-full pl-9 h-11 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/90">Bedrooms</label>
                            <select
                                value={bedrooms}
                                onChange={(e) => setBedrooms(e.target.value)}
                                className="w-full h-11 px-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                            >
                                <option value="0">Studio</option>
                                <option value="1">1 Bed</option>
                                <option value="2">2 Beds</option>
                                <option value="3">3+ Beds</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || !city || !currentRent}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        {isAnalyzing ? "Searching Live Markets..." : "Analyze Market"}
                    </button>
                </form>
            </div>

            {/* Analysis Results */}
            {analysis && (
                <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in-up">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-background/40 border border-white/5 space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Market Average</p>
                            <p className="text-3xl font-bold text-foreground">{analysis.average_market_rent}</p>
                        </div>
                        <div className={cn(
                            "p-5 rounded-xl border space-y-1",
                            analysis.is_rent_control_likely
                                ? "bg-amber-500/10 border-amber-500/20"
                                : "bg-background/40 border-white/5"
                        )}>
                            <p className="text-sm font-medium text-muted-foreground">Rent Control Status</p>
                            <p className={cn(
                                "text-lg font-bold",
                                analysis.is_rent_control_likely ? "text-amber-500" : "text-foreground"
                            )}>
                                {analysis.is_rent_control_likely ? "Likely Protected" : "Standard Rules Apply"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold border-b border-white/5 pb-2 mb-3">Market Intel (You.com)</h3>
                            <p className="text-sm text-foreground/80 leading-relaxed bg-background/30 p-4 rounded-xl border border-white/5">{analysis.market_summary}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold border-b border-white/5 pb-2 mb-3">AI Recommendation</h3>
                            <p className="text-sm font-medium text-primary leading-relaxed">{analysis.recommendation}</p>
                        </div>
                    </div>

                    {/* Generate Letter Button */}
                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <p className="text-sm text-muted-foreground">Want to negotiate? We can draft a letter.</p>
                        <button
                            onClick={handleGenerateLetter}
                            disabled={isGeneratingLetter}
                            className="w-full sm:w-auto px-6 h-11 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                        >
                            {isGeneratingLetter ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                            {isGeneratingLetter ? "Drafting..." : "Draft Negotiation Letter"}
                        </button>
                    </div>

                    {/* Download PDF Link */}
                    {letterPdf && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between animate-fade-in-up">
                            <span className="text-sm font-medium text-emerald-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Letter Generated
                            </span>
                            <a
                                href={`data:application/pdf;base64,${letterPdf}`}
                                download="Rent_Negotiation_Letter.pdf"
                                className="text-sm font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex items-center gap-1"
                            >
                                Download PDF <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
