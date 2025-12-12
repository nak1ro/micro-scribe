import * as React from "react";
import { cn } from "@/lib/utils";
import { socialProofContent } from "../data/content";

export function SocialProofSection() {
    return (
        <section className="relative py-12 overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-muted/30 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8">
                    {socialProofContent.heading}
                </p>

                {/* Logo Grid */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                    {socialProofContent.logos.map((logo, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2",
                                "text-muted-foreground/60 hover:text-muted-foreground",
                                "transition-colors duration-[var(--transition-fast)]"
                            )}
                        >
                            {/* Placeholder for logo - using text with icon style */}
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                                {logo.name.charAt(0)}
                            </div>
                            <span className="text-lg font-semibold">{logo.name}</span>
                        </div>
                    ))}
                </div>

                {/* Stats row */}
                {socialProofContent.stats && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
                        {socialProofContent.stats.map((stat, index) => (
                            <div key={index}>
                                <div className="text-2xl font-bold text-foreground">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
