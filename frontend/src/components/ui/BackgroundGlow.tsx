import * as React from "react";
import { cn } from "@/lib/utils";

interface BackgroundGlowProps {
    className?: string;
}

export function BackgroundGlow({ className }: BackgroundGlowProps) {
    return (
        <div className={cn("absolute -inset-4 pointer-events-none overflow-hidden", className)}>
            {/* Top-left glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl animate-pulse" />
            {/* Bottom-right glow */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-secondary/20 blur-3xl animate-pulse delay-1000" />
        </div>
    );
}
