"use client";

import { useState } from "react";
import { Loader2, DollarSign, MapPin, Bed, CheckCircle, AlertTriangle, XCircle, FileDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const STATES = [
    "CA", "NY", "TX", "FL", "IL", "WA", "MA", "CO", "NJ", "OR"
];

export default function RentCalculator() {
    const [zip, setZip] = useState("");
    const [state, setState] = useState("CA");
    const [bedrooms, setBedrooms] = useState(1);
    const [price, setPrice] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generatingLetter, setGeneratingLetter] = useState(false);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/v1/rent/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zipCode: zip,
                    state: state,
                    bedrooms: Number(bedrooms),
                    price: Number(price)
                })
            });

            if (!res.ok) throw new Error("Analysis failed");
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            alert("Failed to analyze. Please check inputs.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateLetter = async () => {
        if (!result) return;
        setGeneratingLetter(true);

        try {
            const tenantName = prompt("Enter your name:", "John Doe") || "John Doe";
            const landlordName = prompt("Enter landlord name:", "Landlord Inc.") || "Landlord Inc.";

            const res = await fetch("/api/v1/generate/negotiation-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantName,
                    landlordName,
                    currentRent: Number(price),
                    marketAverage: result.market_stats.average,
                    state: state
                })
            });

            if (!res.ok) throw new Error("Failed to generate letter");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "rent_negotiation_letter.pdf";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert("Failed to generate letter.");
        } finally {
            setGeneratingLetter(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-card border rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                Rent Radar
            </h2>

            <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Zip Code</label>
                        <div className="relative mt-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background py-2 pr-3 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="90210"
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">State</label>
                        <select
                            className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        >
                            {STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Bedrooms</label>
                        <div className="relative mt-1">
                            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                className="flex h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pr-8 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={bedrooms}
                                onChange={(e) => setBedrooms(Number(e.target.value))}
                            >
                                {[0, 1, 2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{n === 0 ? "Studio" : `${n} BR`}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Monthly Rent ($)</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input
                                type="number"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background py-2 pr-3 pl-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="2000"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Check Deal"}
                </button>
            </form>

            {result && (
                <div className="mt-8 border-t pt-6 space-y-4">
                    {/* Rating Banner */}
                    <div className={cn(
                        "p-4 rounded-lg flex items-start gap-4",
                        result.analysis.color === "green" ? "bg-green-100 text-green-800" :
                            result.analysis.color === "red" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                    )}>
                        {result.analysis.color === "green" ? <CheckCircle className="w-6 h-6 shrink-0" /> :
                            result.analysis.color === "red" ? <XCircle className="w-6 h-6 shrink-0" /> :
                                <AlertTriangle className="w-6 h-6 shrink-0" />}

                        <div>
                            <h3 className="font-bold text-lg">{result.analysis.rating}</h3>
                            <p className="text-sm mt-1">
                                Avg (est): <b>${result.market_stats.average?.toLocaleString()}</b> <br />
                                Range: ${result.market_stats.min?.toLocaleString()} - ${result.market_stats.max?.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Difference */}
                    <div className="text-center text-sm text-muted-foreground">
                        {result.analysis.difference > 0
                            ? `You are paying $${result.analysis.difference.toFixed(0)} above average.`
                            : `You are saving $${Math.abs(result.analysis.difference).toFixed(0)} vs average!`}
                    </div>

                    {/* Market Summary */}
                    {result.market_stats.market_summary && (
                        <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
                            {result.market_stats.market_summary}
                        </div>
                    )}

                    {/* Comparables */}
                    {result.market_stats.comparables?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Comparable Listings</h4>
                            <div className="space-y-2">
                                {result.market_stats.comparables.slice(0, 5).map((comp: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-sm bg-muted/30 px-3 py-2 rounded-md">
                                        <span className="text-muted-foreground">{comp.address || comp.source}</span>
                                        <span className="font-medium">${comp.rent?.toLocaleString()}/mo</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rent Control Info */}
                    {result.analysis.rent_control_applies && (
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                            <strong>🏛 Rent Control Applies.</strong>
                            {result.analysis.max_legal_increase && (
                                <span> Max legal increase: {result.analysis.max_legal_increase}</span>
                            )}
                        </div>
                    )}

                    {/* Sources Attribution */}
                    {result.rent_laws?.sources?.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-xs font-medium text-muted-foreground">Sources</h4>
                            {result.rent_laws.sources.slice(0, 3).map((src: any, i: number) => (
                                <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    {src.title || src.url}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Negotiation Letter Button — only for overpaying */}
                    {result.analysis.color === "red" && (
                        <button
                            onClick={handleGenerateLetter}
                            disabled={generatingLetter}
                            className="w-full flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                            {generatingLetter ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                            ) : (
                                <><FileDown className="w-4 h-4" /> Generate Negotiation Letter (PDF)</>
                            )}
                        </button>
                    )}

                    {/* Data Source Attribution */}
                    <p className="text-center text-xs text-muted-foreground pt-2">
                        Market data powered by <span className="font-medium">You.com Search API</span>
                    </p>
                </div>
            )}
        </div>
    );
}
