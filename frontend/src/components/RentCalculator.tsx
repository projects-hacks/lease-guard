"use client";

import { useState } from "react";
import { DollarSign, MapPin, Search, Mail, Loader2, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RentAnalysis {
    market_stats: {
        average: number;
        market_summary: string;
    };
    analysis: {
        rating: string;
        color: string;
        difference: number;
        percentage_diff: number;
        rent_control_applies: boolean;
        max_legal_increase: string | null;
    };
    rent_laws: {
        explanation: string;
    } | null;
}

const US_STATES = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'DC', label: 'District Of Columbia' },
    { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

export default function RentCalculator() {
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [currentRent, setCurrentRent] = useState("");
    const [bedrooms, setBedrooms] = useState("1");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<RentAnalysis | null>(null);
    const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
    const [letterPdf, setLetterPdf] = useState<string | null>(null);

    const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers, max 5 digits
        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
        setZipCode(val);
    };

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city || !zipCode || !stateCode || !currentRent) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        setLetterPdf(null);

        try {
            const res = await fetch(`/api/v1/rent/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zipCode,
                    city,
                    state: stateCode,
                    bedrooms: parseInt(bedrooms),
                    price: parseFloat(currentRent)
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
        if (!analysis || !stateCode) return;
        setIsGeneratingLetter(true);

        try {
            const tenantName = prompt("Enter your name:", "John Doe") || "John Doe";
            const landlordName = prompt("Enter landlord name:", "Landlord Inc.") || "Landlord Inc.";

            const res = await fetch(`/api/v1/generate/negotiation-letter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantName,
                    landlordName,
                    currentRent: parseFloat(currentRent),
                    marketAverage: analysis.market_stats.average,
                    state: stateCode
                })
            });

            if (!res.ok) throw new Error("Failed to generate letter");

            const blob = await res.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                setLetterPdf(base64data);
            };

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
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
                        {/* Row 1: City & State (Wide) & Zip */}
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-sm font-medium text-foreground/90 flex justify-between">
                                City
                            </label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="e.g. San Francisco"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full pl-9 px-4 h-11 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none group-hover:border-white/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                            <label className="text-sm font-medium text-foreground/90">State</label>
                            <div className="relative group">
                                <select
                                    value={stateCode}
                                    onChange={(e) => setStateCode(e.target.value)}
                                    className="w-full h-11 px-4 pr-10 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none group-hover:border-white/20 text-foreground cursor-pointer"
                                    required
                                >
                                    <option value="" disabled className="text-muted-foreground">Select State</option>
                                    {US_STATES.map(s => (
                                        <option key={s.value} value={s.value} className="bg-background text-foreground">{s.value} - {s.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2 sm:col-span-1 lg:col-span-1">
                            <label className="text-sm font-medium text-foreground/90">Zip Code</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="94107"
                                    value={zipCode}
                                    onChange={handleZipChange}
                                    maxLength={5}
                                    className="w-full px-4 h-11 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none tracking-widest text-center group-hover:border-white/20"
                                />
                            </div>
                        </div>

                        {/* Row 2: Rent & Layout */}
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-sm font-medium text-foreground/90">Your Monthly Rent</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3.5 flex items-center justify-center w-5 h-5 bg-emerald-500/20 rounded-full group-focus-within:bg-emerald-500/40 transition-colors">
                                    <DollarSign className="h-3 w-3 text-emerald-400 font-bold" />
                                </div>
                                <input
                                    type="number"
                                    placeholder="2500"
                                    value={currentRent}
                                    onChange={(e) => setCurrentRent(e.target.value)}
                                    className="w-full pl-10 h-11 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none group-hover:border-white/20 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-sm font-medium text-foreground/90">Layout</label>
                            <div className="relative group">
                                <select
                                    value={bedrooms}
                                    onChange={(e) => setBedrooms(e.target.value)}
                                    className="w-full h-11 px-4 pr-10 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none group-hover:border-white/20 cursor-pointer text-foreground"
                                >
                                    <option value="0" className="bg-background text-foreground">Studio</option>
                                    <option value="1" className="bg-background text-foreground">1 Bedroom</option>
                                    <option value="2" className="bg-background text-foreground">2 Bedrooms</option>
                                    <option value="3" className="bg-background text-foreground">3+ Bedrooms</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || !zipCode || zipCode.length < 5 || !stateCode || !currentRent || !city}
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
                        <div className="p-5 rounded-xl bg-background/40 border border-white/5 space-y-1 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-sm font-medium text-muted-foreground relative">Market Average</p>
                            <p className="text-3xl font-bold text-foreground relative">
                                ${analysis.market_stats.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className={cn(
                            "p-5 rounded-xl border space-y-1 relative overflow-hidden",
                            analysis.analysis.color === "green" ? "bg-emerald-500/10 border-emerald-500/20" :
                                analysis.analysis.color === "red" ? "bg-red-500/10 border-red-500/20" :
                                    "bg-amber-500/10 border-amber-500/20"
                        )}>
                            <p className="text-sm font-medium text-muted-foreground">Rating</p>
                            <p className={cn(
                                "text-lg font-bold",
                                analysis.analysis.color === "green" ? "text-emerald-500" :
                                    analysis.analysis.color === "red" ? "text-red-500" :
                                        "text-amber-500"
                            )}>
                                {analysis.analysis.rating} ({analysis.analysis.percentage_diff > 0 ? "+" : ""}{analysis.analysis.percentage_diff.toFixed(1)}%)
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold border-b border-white/5 pb-2 mb-3">Market Intel (You.com)</h3>
                            <p className="text-sm text-foreground/80 leading-relaxed bg-background/30 p-4 rounded-xl border border-white/5">{analysis.market_stats.market_summary}</p>
                        </div>
                        {analysis.rent_laws?.explanation && (
                            <div>
                                <h3 className="text-lg font-semibold border-b border-white/5 pb-2 mb-3">Rent Control Laws</h3>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">{analysis.rent_laws.explanation}</p>
                            </div>
                        )}
                    </div>

                    {/* Generate Letter Button */}
                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <p className="text-sm text-muted-foreground flex-1">
                            Want to negotiate? We can draft a formal letter powered by AI and Foxit PDF.
                        </p>
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
                                href={letterPdf}
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
