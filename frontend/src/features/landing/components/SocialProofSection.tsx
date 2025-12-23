"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { socialProofContent } from "../data/content";

// Hook for counting animation
function useCountUp(end: number, duration: number = 2000, isInView: boolean) {
    const [count, setCount] = React.useState(0);
    const countRef = React.useRef(0);

    React.useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (end - startValue) * easeOut);

            if (current !== countRef.current) {
                countRef.current = current;
                setCount(current);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, isInView]);

    return count;
}

// Hook for intersection observer
function useInView(threshold = 0.5) {
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
            { threshold, rootMargin: "-50px" }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isInView };
}

// Parse stat value for animation
function parseStatValue(value: string): { number: number; prefix: string; suffix: string } {
    const match = value.match(/^([^0-9]*)([0-9.]+)(.*)$/);
    if (match) {
        return {
            prefix: match[1],
            number: parseFloat(match[2]),
            suffix: match[3],
        };
    }
    return { prefix: "", number: 0, suffix: value };
}

function AnimatedStat({ value, label, isInView, delay }: { value: string; label: string; isInView: boolean; delay: number }) {
    const parsed = parseStatValue(value);
    const count = useCountUp(parsed.number, 1500, isInView);

    // Format with decimal if original had decimal
    const formattedCount = parsed.number % 1 !== 0
        ? count.toFixed(1)
        : count.toString();

    return (
        <div
            className={cn(
                "transition-all duration-700",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="text-3xl font-bold text-foreground tabular-nums">
                {parsed.prefix}{formattedCount}{parsed.suffix}
            </div>
            <div className="text-sm text-muted-foreground">
                {label}
            </div>
        </div>
    );
}

export function SocialProofSection() {
    const { ref, isInView } = useInView(0.5);

    return (
        <section className="relative py-12 overflow-hidden" ref={ref}>
            {/* Subtle background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-muted/30 blur-3xl" />
            </div>

            {/* Top and bottom fades */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <p
                    className={cn(
                        "text-center text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
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
                                "transition-all duration-700",
                                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                            )}
                            style={{ transitionDelay: `${100 + index * 80}ms` }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                                {logo.name.charAt(0)}
                            </div>
                            <span className="text-lg font-semibold">{logo.name}</span>
                        </div>
                    ))}
                </div>

                {/* Stats row with animated counters */}
                {socialProofContent.stats && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
                        {socialProofContent.stats.map((stat, index) => (
                            <AnimatedStat
                                key={index}
                                value={stat.value}
                                label={stat.label}
                                isInView={isInView}
                                delay={500 + index * 150}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
