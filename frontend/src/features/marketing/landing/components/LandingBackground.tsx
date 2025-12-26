import * as React from "react";
import { cn } from "@/lib/utils";

// Unified background wrapper for landing page
export function LandingBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Base gradient - subtle purple to blue flow */}
            <div className="fixed inset-0 pointer-events-none">

            </div>

            {/* Grid pattern overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)
                        `,
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* Diagonal accent lines */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Top-right diagonal */}
                <div
                    className="absolute -top-20 right-0 w-[1px] h-[400px] bg-gradient-to-b from-transparent via-primary/20 to-transparent rotate-45 origin-top"
                    style={{ transform: "rotate(45deg) translateX(200px)" }}
                />
                {/* Bottom-left diagonal */}
                <div
                    className="absolute bottom-1/4 left-0 w-[1px] h-[300px] bg-gradient-to-b from-transparent via-secondary/15 to-transparent"
                    style={{ transform: "rotate(-45deg) translateX(-100px)" }}
                />
            </div>

            {/* Floating geometric shapes */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Circle outline - top right */}
                <div className="absolute top-20 right-[15%] w-32 h-32 rounded-full border border-primary/10" />

                {/* Small filled circle - mid left */}
                <div className="absolute top-1/2 left-[10%] w-4 h-4 rounded-full bg-primary/20" />

                {/* Square outline - bottom */}
                <div className="absolute bottom-40 right-[20%] w-20 h-20 border border-secondary/10 rotate-12" />

                {/* Dot grid cluster */}
                <div className="absolute top-[60%] left-[5%] grid grid-cols-3 gap-2 opacity-20">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
