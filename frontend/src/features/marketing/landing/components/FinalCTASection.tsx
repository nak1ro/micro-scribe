"use client";

import * as React from "react";
import { Sparks, Flash } from "iconoir-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui";
import { finalCTAContent } from "../data/content";
import { useInView } from "@/hooks";

// Pre-calculated heights to avoid hydration mismatch from Math.sin/cos
const WAVEFORM_HEIGHTS = [40, 55, 65, 70, 68, 60, 48, 35, 30, 38, 50, 62];

// Animated waveform bars for decoration
function AnimatedWaveform({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-1 h-12", className)}>
            {WAVEFORM_HEIGHTS.map((height, i) => (
                <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-primary/40 to-primary animate-pulse"
                    style={{
                        height: `${height}%`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: `${1000 + i * 50}ms`,
                    }}
                />
            ))}
        </div>
    );
}

export function FinalCTASection() {
    const { ref, isInView } = useInView(0.2);

    return (
        <section className="relative py-16 sm:py-20 mb-16 sm:mb-24 md:min-h-[60vh] md:flex md:items-center overflow-hidden" ref={ref}>
            {/* Enhanced gradient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[300px] sm:h-[500px] rounded-full bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] rounded-full bg-primary/10 blur-2xl animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-[120px] sm:w-[250px] h-[120px] sm:h-[250px] rounded-full bg-secondary/10 blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            {/* Top and bottom fades for smooth transition */}
            <div className="absolute top-0 left-0 right-0 h-16 sm:h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            {/* Decorative waveforms */}
            <AnimatedWaveform className="absolute left-8 top-1/3 opacity-30 hidden lg:flex" />
            <AnimatedWaveform className="absolute right-8 bottom-1/3 opacity-30 hidden lg:flex" />

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center w-full">
                {/* Badge */}
                <div
                    className={cn(
                        "inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 text-xs sm:text-sm font-medium rounded-full",
                        "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    <Flash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-primary">Get started in 30 seconds</span>
                </div>

                {/* Heading */}
                <h2
                    className={cn(
                        "text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight",
                        "transition-all duration-700 delay-100",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    {finalCTAContent.heading}
                </h2>

                {/* Subheading */}
                <p
                    className={cn(
                        "mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0",
                        "transition-all duration-700 delay-200",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    {finalCTAContent.subheading}
                </p>

                {/* CTA Button - Enhanced */}
                <div
                    className={cn(
                        "mt-8 sm:mt-10",
                        "transition-all duration-700 delay-300",
                        isInView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                    )}
                >
                    {/* Shorter text on mobile, full text on larger screens */}
                    <CTAButton
                        href={finalCTAContent.cta.href}
                        size="md"
                        className="whitespace-nowrap sm:px-8 sm:py-4 sm:text-lg"
                        leftIcon={<Sparks className="h-4 w-4 sm:h-5 sm:w-5" />}
                    >
                        <span className="sm:hidden">Start Free</span>
                        <span className="hidden sm:inline">{finalCTAContent.cta.label}</span>
                    </CTAButton>
                </div>

                {/* Note */}
                <p
                    className={cn(
                        "mt-6 text-sm text-muted-foreground",
                        "transition-all duration-700 delay-400",
                        isInView ? "opacity-100" : "opacity-0"
                    )}
                >
                    {finalCTAContent.note}
                </p>

            </div>
        </section>
    );
}
