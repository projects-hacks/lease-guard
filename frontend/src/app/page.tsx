import Link from "next/link";
import { ShieldCheck, Camera, DollarSign, ArrowRight, CheckCircle2, Mic, Wrench } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    name: "Legal Shield",
    href: "/upload",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    bgHover: "group-hover:bg-indigo-500/20",
    borderHover: "group-hover:border-indigo-500/50",
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
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    bgHover: "group-hover:bg-orange-500/20",
    borderHover: "group-hover:border-orange-500/50",
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
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    bgHover: "group-hover:bg-emerald-500/20",
    borderHover: "group-hover:border-emerald-500/50",
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
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    bgHover: "group-hover:bg-cyan-500/20",
    borderHover: "group-hover:border-cyan-500/50",
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
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] relative overflow-hidden bg-background">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: "3s" }} />

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-8 py-16 px-4 text-center md:py-32">
        <div className="flex flex-col items-center gap-6 max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-semibold bg-white/5 text-foreground backdrop-blur-md shadow-sm">
            <span className="flex w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            AI-Powered Tenant Protection
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl pb-2">
            <span className="text-foreground">Lease</span>
            <span className="text-gradient-primary">Guard</span>
          </h1>

          <p className="max-w-[600px] text-muted-foreground text-base sm:text-lg md:text-xl font-medium leading-relaxed px-2">
            Your AI shield against unfair leases, stolen deposits, and overpriced rent. Designed exclusively for tenants.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-sm sm:max-w-none justify-center">
            <Link
              href="/upload"
              className="group relative inline-flex h-12 md:h-14 items-center justify-center rounded-full bg-primary px-8 text-sm md:text-base font-semibold text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105"
            >
              Analyze My Lease
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -z-10 rounded-full bg-primary/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/chat"
              className="inline-flex h-12 md:h-14 items-center justify-center rounded-full glass px-8 text-sm md:text-base font-medium shadow-sm transition-all hover:bg-white/10 hover:scale-105"
            >
              <Mic className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
              Voice Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-12 md:py-24 px-4 bg-black/20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-gradient">Comprehensive Protection</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">Everything you need to secure your home and protect your wallet, powered by advanced AI models.</p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, idx) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className={`group flex flex-col items-start space-y-4 p-5 sm:p-6 rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${f.borderHover} animate-fade-in-up`}
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <div className={`p-3 sm:p-4 rounded-xl ${f.bg} ${f.bgHover} transition-colors ring-1 ring-white/5`}>
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${f.color}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">{f.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.description}</p>
                  <div className="w-full pt-3 sm:pt-4 border-t border-white/5">
                    <ul className="text-xs list-none space-y-2 text-muted-foreground">
                      {f.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 items-center">
                          <CheckCircle2 className={`w-4 h-4 ${f.color} shrink-0`} />
                          <span className="font-medium">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 md:py-8 px-4 border-t border-white/5 bg-black/40 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 LeaseGuard • DeveloperWeek Hackathon
          </p>
          <div className="flex items-center flex-wrap justify-center gap-2 text-xs text-muted-foreground/60 font-medium">
            <span>Powered by:</span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5">Google Gemini</span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5">Deepgram Aura</span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5">Foxit SDK</span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5">You.com API</span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5">Sanity.io</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
