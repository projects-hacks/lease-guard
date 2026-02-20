"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText, Camera, DollarSign, Mic, Wrench, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Shield", href: "/upload", icon: FileText },
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
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
                <div className="container flex h-14 items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2 font-bold">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span>LeaseGuard</span>
                    </Link>
                    <div className="flex flex-1 items-center justify-end space-x-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-foreground/80",
                                        isActive
                                            ? "bg-secondary text-secondary-foreground"
                                            : "text-foreground/60"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile Top Bar (slim) */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
                <div className="flex h-12 items-center justify-center px-4">
                    <Link href="/" className="flex items-center space-x-2 font-bold">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-base">LeaseGuard</span>
                    </Link>
                </div>
            </nav>

            {/* Mobile Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t md:hidden safe-area-bottom">
                <div className="flex items-center justify-around h-[68px] px-1">
                    {/* Home */}
                    <Link
                        href="/"
                        className={cn(
                            "flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-colors active:scale-95",
                            pathname === "/"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Home className="h-5 w-5" />
                        <span className="text-[10px] leading-tight font-medium">Home</span>
                    </Link>

                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-colors active:scale-95",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                                <span className="text-[10px] leading-tight font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
