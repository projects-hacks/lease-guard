import Link from "next/link";
import { ShieldCheck, Camera, DollarSign, ArrowRight, CheckCircle2, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/20">
        <div className="container flex flex-col items-center gap-4 px-4 md:px-6">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-2">
            New: AI-Powered Deposit Protection
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
            LeaseGuard
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Your AI-powered legal shield against unfair leases, stolen deposits, and overpriced rent.
            Empowering tenants with GPT-4o, Computer Vision, and Real-time Market Data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm sm:max-w-none justify-center">
            <Link
              href="/upload"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Analyze My Lease <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/deposit"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Start Move-In Inspection
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-12 md:py-24 lg:py-32 px-4 md:px-6 mx-auto">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">

          {/* Feature 1: Legal Shield */}
          <div className="flex flex-col items-center space-y-4 text-center group hover:bg-accent/50 p-6 rounded-xl transition-colors">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Legal Shield</h2>
            <p className="max-w-[300px] text-muted-foreground">
              Upload your lease PDF. Our AI detects illegal clauses, red flags, and hidden fees instantly.
            </p>
            <ul className="text-sm text-left list-none space-y-2 mt-4 text-muted-foreground/80">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> GPT-4o Clause Analysis</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Foxit PDF Extraction</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Auto-Generate Counter-Letters</li>
            </ul>
          </div>

          {/* Feature 2: Deposit Defender */}
          <div className="flex flex-col items-center space-y-4 text-center group hover:bg-accent/50 p-6 rounded-xl transition-colors">
            <div className="p-4 bg-orange-500/10 rounded-full group-hover:bg-orange-500/20 transition-colors">
              <Camera className="h-10 w-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold">Deposit Defender</h2>
            <p className="max-w-[300px] text-muted-foreground">
              Record a video walkthrough. Computer Vision identifies defects to protect your security deposit.
            </p>
            <ul className="text-sm text-left list-none space-y-2 mt-4 text-muted-foreground/80">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> OpenCV Frame Extraction</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> GPT-4o Vision Defect Detection</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Condition Report PDF</li>
            </ul>
          </div>

          {/* Feature 3: Rent Radar */}
          <div className="flex flex-col items-center space-y-4 text-center group hover:bg-accent/50 p-6 rounded-xl transition-colors">
            <div className="p-4 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Rent Radar</h2>
            <p className="max-w-[300px] text-muted-foreground">
              Know the true market value. Compare your rent against real-time data and negotiate better rates.
            </p>
            <ul className="text-sm text-left list-none space-y-2 mt-4 text-muted-foreground/80">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Market Rent Estimation</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Fair Value Rating</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Negotiation Tips</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 LeaseGuard Inc. Built for DeveloperWeek Hackathon.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
            <Link href="/privacy" className="text-xs hover:underline underline-offset-4">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
