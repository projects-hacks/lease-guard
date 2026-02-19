import RentCalculator from "@/components/RentCalculator";

export default function RentPage() {
    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Rent Radar</h1>
                <p className="text-muted-foreground mt-2">
                    Check if you're overpaying for your apartment.
                </p>
            </div>

            <RentCalculator />

            <div className="mt-8 text-center text-xs text-muted-foreground max-w-sm">
                <p>Estimates based on market data for your area.</p>
            </div>
        </div>
    );
}
