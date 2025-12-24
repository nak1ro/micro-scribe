"use client";

import * as React from "react";
import Link from "next/link";
import { Sparks, Shield, CreditCard, ArrowRight, Flash } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { finalCTAContent } from "../data/content";

// Hook for intersection observer
function useInView(threshold = 0.3) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = React.useState(false);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isInView };
}

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
        <section className="relative min-h-screen flex items-center py-12 overflow-hidden" ref={ref}>
            {/* Enhanced gradient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-2xl animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-[250px] h-[250px] rounded-full bg-secondary/10 blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            {/* Top and bottom fades for smooth transition */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            {/* Decorative waveforms */}
            <AnimatedWaveform className="absolute left-8 top-1/3 opacity-30 hidden lg:flex" />
            <AnimatedWaveform className="absolute right-8 bottom-1/3 opacity-30 hidden lg:flex" />

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-sm font-medium rounded-full",
                        "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    <Flash className="w-4 h-4 text-primary" />
                    <span className="text-primary">Get started in 30 seconds</span>
                </div>

                {/* Heading */}
                <h2
                    className={cn(
                        "text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl leading-tight",
                        "transition-all duration-700 delay-100",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    {finalCTAContent.heading}
                </h2>

                {/* Subheading */}
                <p
                    className={cn(
                        "mt-6 text-xl text-muted-foreground max-w-2xl mx-auto",
                        "transition-all duration-700 delay-200",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    {finalCTAContent.subheading}
                </p>

                {/* CTA Button - Enhanced */}
                <div
                    className={cn(
                        "mt-10",
                        "transition-all duration-700 delay-300",
                        isInView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                    )}
                >
                    <Link href={finalCTAContent.cta.href}>
                        <Button
                            size="lg"
                            className={cn(
                                "text-lg px-10 py-7 h-auto",
                                "bg-gradient-to-r from-primary to-primary/65",
                                "shadow-xl shadow-primary/30",
                                "hover-glow",
                                "group"
                            )}
                        >
                            <Sparks className="h-5 w-5 mr-2 hover-icon-spin" />
                            {finalCTAContent.cta.label}
                            <ArrowRight className="h-5 w-5 ml-2 hover-icon-arrow" />
                        </Button>
                    </Link>
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

                {/* Trust badges - Enhanced */}
                <div
                    className={cn(
                        "mt-10 flex flex-wrap justify-center gap-8 text-sm",
                        "transition-all duration-700 delay-500",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border">
                        <Shield className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border">
                        <CreditCard className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">No Credit Card Required</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
