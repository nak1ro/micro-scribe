"use client";

import * as React from "react";
import { Shield, CreditCard, RefreshCw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { trustSignals } from "../data";

// Icon mapping for trust signals
const iconMap: Record<string, React.ElementType> = {
    Shield,
    CreditCard,
    RefreshCw,
    Lock,
};

// Trust badges section with security and payment info
export function TrustBadges() {
    return (
        <div className="flex flex-wrap justify-center gap-6 text-sm">
            {trustSignals.map((signal, index) => {
                const Icon = iconMap[signal.icon] || Shield;
                return (
                    <div
                        key={index}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2",
                            "rounded-full border border-border bg-card/50",
                            "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4 text-success" />
                        <span>{signal.text}</span>
                    </div>
                );
            })}
        </div>
    );
}
