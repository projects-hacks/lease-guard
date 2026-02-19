"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText, Camera, DollarSign, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Legal Shield", href: "/upload", icon: FileText },
    { name: "Deposit Defender", href: "/deposit", icon: Camera },
    { name: "Rent Radar", href: "/rent", icon: DollarSign },
    { name: "Voice Assistant", href: "/chat", icon: Mic },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Link href="/" className="mr-6 flex items-center space-x-2 font-bold">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="hidden sm:inline-block">LeaseGuard</span>
                </Link>
                <div className="flex flex-1 items-center justify-end space-x-4 md:justify-end">
                    <nav className="flex items-center space-x-2 text-sm font-medium">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-1 px-3 py-2 rounded-md transition-colors hover:text-foreground/80",
                                        pathname === item.href || pathname?.startsWith(item.href + "/")
                                            ? "bg-secondary text-secondary-foreground"
                                            : "text-foreground/60"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden md:inline">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </nav>
    );
}
