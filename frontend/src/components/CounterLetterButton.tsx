"use client";

import { useState } from "react";
import { Loader2, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    clause: any;
    className?: string;
    variant?: "default" | "full";
}

export default function CounterLetterButton({ clause, className, variant = "default" }: Props) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // In a real app, we'd get these from user context or inputs
            // For hackathon, we'll prompt or use placeholders
            const tenantName = prompt("Enter Tenant Name for the letter:", "John Doe") || "John Doe";
            const landlordName = prompt("Enter Landlord Name:", "Landlord Inc.") || "Landlord Inc.";
            const state = "CA"; // Should come from analysis context

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate/counter-letter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tenantName,
                    landlordName,
                    clause,
                    state
                }),
            });

            if (!response.ok) throw new Error("Failed to generate letter");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `counter_letter_${clause.clauseType}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error(error);
            alert("Failed to generate counter-letter. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
                variant === "full" ? "w-full" : "",
                className
            )}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate Counter-Letter
                </>
            )}
        </button>
    );
}
