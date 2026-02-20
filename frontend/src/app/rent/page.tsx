import RentCalculator from "@/components/RentCalculator";
import { DollarSign } from "lucide-react";

export default function RentPage() {
    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-background p-4 sm:p-6 lg:p-10 relative overflow-hidden pb-28 md:pb-10">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-[5%] w-[35%] h-[35%] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none animate-float" />
            <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

            <div className="max-w-2xl mx-auto relative z-10 space-y-6 sm:space-y-8">
                <div className="text-center animate-fade-in-up">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl ring-1 ring-emerald-500/20">
                            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                        </div>
                        <span>Rent <span className="text-gradient-primary">Radar</span></span>
                    </h1>
                    <p className="text-muted-foreground mt-3 text-sm sm:text-base px-2">
                        Check if you&apos;re overpaying for your apartment.
                    </p>
                </div>

                <RentCalculator />

                <div className="text-center text-xs text-muted-foreground/60 font-medium">
                    <p>Estimates based on market data for your area.</p>
                </div>
            </div>
        </div>
    );
}
