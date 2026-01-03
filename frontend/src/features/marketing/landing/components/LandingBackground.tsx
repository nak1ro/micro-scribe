import * as React from "react";
import { cn } from "@/lib/utils";

// Unified background wrapper for landing page
export function LandingBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Grid pattern overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
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

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
