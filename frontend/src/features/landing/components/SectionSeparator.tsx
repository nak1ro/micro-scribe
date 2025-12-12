import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionSeparatorProps {
    variant?: "default" | "gradient" | "dots";
    className?: string;
}

/**
 * Flat 2.0 style section separator
 * - Clear visual break between landing sections
 * - Generous spacing with subtle visual elements
 */
export function SectionSeparator({
    variant = "default",
    className,
}: SectionSeparatorProps) {
    if (variant === "dots") {
        return (
            <div className={cn("flex justify-center items-center gap-3 py-16", className)}>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-primary/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>
        );
    }

    if (variant === "gradient") {
        return (
            <div className={cn("relative py-16", className)}>
                <div className="mx-auto max-w-xs h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
        );
    }

    // Default: wider subtle line
    return (
        <div className={cn("relative py-16", className)}>
            <div className="mx-auto max-w-lg h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
    );
}
