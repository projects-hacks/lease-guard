import Link from "next/link";
import { ShieldCheck, Camera, DollarSign, ArrowRight, CheckCircle2, Mic, Wrench } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    name: "Legal Shield",
    href: "/upload",
    color: "text-primary",
    bg: "bg-primary/10",
    bgHover: "group-hover:bg-primary/20",
    description: "Upload your lease PDF. AI detects illegal clauses, red flags, and hidden fees.",
    bullets: [
      "Gemini Clause Analysis",
      "Foxit PDF Extraction",
      "Auto Counter-Letter PDF",
    ],
  },
  {
    icon: Camera,
    name: "Deposit Defender",
    href: "/deposit",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    bgHover: "group-hover:bg-orange-500/20",
    description: "Record a video walkthrough. Computer Vision identifies defects to protect your deposit.",
    bullets: [
      "OpenCV Frame Extraction",
      "Gemini Vision Detection",
      "Condition Report PDF",
    ],
  },
  {
    icon: DollarSign,
    name: "Rent Radar",
    href: "/rent",
    color: "text-green-500",
    bg: "bg-green-500/10",
    bgHover: "group-hover:bg-green-500/20",
    description: "Know true market value. Compare your rent against real-time data from You.com.",
    bullets: [
      "You.com Market Search",
      "Rent Control Detection",
      "Negotiation Letter PDF",
    ],
  },
  {
    icon: Wrench,
    name: "Maintenance Reporter",
    href: "/maintenance",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    bgHover: "group-hover:bg-blue-500/20",
    description: "Describe issues by voice. AI creates a formal maintenance request letter.",
    bullets: [
      "Deepgram Nova-3 STT",
      "Audio Intelligence",
      "Auto-Generate PDF",
    ],
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)]">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-8 py-16 px-4 text-center md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="flex flex-col items-center gap-4 max-w-2xl">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
            AI-Powered Tenant Protection
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
            LeaseGuard
          </h1>
          <p className="max-w-[600px] text-muted-foreground text-base md:text-lg">
            Your AI shield against unfair leases, stolen deposits, and overpriced rent.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xs sm:max-w-none justify-center">
            <Link
              href="/upload"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Analyze My Lease <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            >
              <Mic className="mr-2 h-4 w-4" />
              Voice Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group flex flex-col items-center space-y-3 text-center p-5 rounded-xl border bg-card hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className={`p-3 rounded-full ${f.bg} ${f.bgHover} transition-colors`}>
                  <Icon className={`h-7 w-7 ${f.color}`} />
                </div>
                <h2 className="text-lg font-bold">{f.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                <ul className="text-xs text-left list-none space-y-1.5 mt-auto text-muted-foreground/80 w-full">
                  {f.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t bg-background">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 LeaseGuard • DeveloperWeek Hackathon
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Gemini • Deepgram • Foxit • You.com • Sanity
          </p>
        </div>
      </footer>
    </div>
  );
}
