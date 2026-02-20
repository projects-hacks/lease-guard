"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FolderOpen, Camera, DollarSign, Mic, Wrench, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Leases", href: "/leases", icon: FolderOpen },
    { name: "Deposit", href: "/deposit", icon: Camera },
    { name: "Rent", href: "/rent", icon: DollarSign },
    { name: "Fix", href: "/maintenance", icon: Wrench },
    { name: "Voice", href: "/chat", icon: Mic },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Top Bar */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl hidden md:block">
                <div className="container flex h-16 items-center flex-wrap">
                    <Link href="/" className="mr-8 flex items-center space-x-2 font-bold group">
                        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors border border-primary/20">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg tracking-tight">Lease<span className="text-primary">Guard</span></span>
                    </Link>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive && "stroke-[2.5]")} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile Top Bar (slim) */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl md:hidden">
                <div className="flex h-14 items-center justify-center px-4">
                    <Link href="/" className="flex items-center space-x-2 font-bold">
                        <div className="p-1 rounded bg-primary/10 border border-primary/20">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg tracking-tight">Lease<span className="text-primary">Guard</span></span>
                    </Link>
                </div>
            </nav>

            {/* Mobile Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t-0 md:hidden safe-area-bottom pb-1 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-around h-[68px] px-2">
                    {/* Home */}
                    <Link
                        href="/"
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all duration-200 active:scale-95",
                            pathname === "/"
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Home className={cn("h-5 w-5", pathname === "/" && "stroke-[2.5]")} />
                        <span className="text-[10px] leading-tight font-semibold">Home</span>
                    </Link>

                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all duration-200 active:scale-95",
                                    isActive
                                        ? "text-primary bg-primary/10 shadow-inner"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5] mb-0.5")} />
                                <span className={cn("text-[10px] leading-tight", isActive ? "font-bold" : "font-medium")}>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
