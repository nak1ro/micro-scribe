"use client";

import * as React from "react";
import { ArrowRight, Flash, Globe, Sparks, Xmark, Check } from "iconoir-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui";

// Hook for intersection observer
function useInView(threshold = 0.2) {
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

// Hook for counting animation
function useCountUp(end: number, duration: number = 1500, isInView: boolean, suffix: string = "") {
    const [display, setDisplay] = React.useState(`0${suffix}`);

    React.useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = end * easeOut;

            // Handle decimal formatting
            if (suffix.includes(".")) {
                setDisplay(current.toFixed(1) + suffix.replace(/[0-9.]/g, ""));
            } else {
                setDisplay(Math.floor(current) + suffix);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplay(end + suffix);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, isInView, suffix]);

    return display;
}

// Bold statistics that grab attention
const stats = [
    { value: 98.5, suffix: "%", label: "Accuracy", icon: Sparks },
    { value: 100, suffix: "+", label: "Languages", icon: Globe },
    { value: 5, suffix: "x", label: "Faster", icon: Flash },
];

// The transformation - what we solve
const transformation = {
    before: {
        title: "The Old Way",
        items: [
            "Hours typing word by word",
            "Missing key details",
            "Expensive human transcribers",
            "Slow turnaround times",
        ],
    },
    after: {
        title: "The ScribeRocket Way",
        items: [
            "Automatic speaker detection",
            "Perfect timestamps",
            "One-click export",
            "Results in minutes",
        ],
    },
};

function AnimatedStat({
    value,
    suffix,
    label,
    icon: Icon,
    isInView,
    delay
}: {
    value: number;
    suffix: string;
    label: string;
    icon: React.ElementType;
    isInView: boolean;
    delay: number;
}) {
    const displayValue = useCountUp(value, 1500, isInView, suffix);

    return (
        <div
            className={cn(
                "relative group text-center p-8 rounded-2xl",
                "bg-muted/30 backdrop-blur-sm border border-border",
                "hover-subtle",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{
                transition: `opacity 700ms ${delay}ms, transform 700ms ${delay}ms`
            }}
        >
            <div className="relative">
                <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-2 tracking-tighter tabular-nums">
                    {displayValue}
                </div>
                <div className="text-lg text-muted-foreground font-medium">
                    {label}
                </div>
            </div>
        </div>
    );
}

export function ProblemSolutionSection() {
    const { ref, isInView } = useInView(0.15);

    return (
        <section className="relative py-24 overflow-hidden" ref={ref}>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Headline */}
                <div
                    className={cn(
                        "text-center mb-16",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20">
                        Why ScribeRocket?
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
                        Stop wasting time on
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/65">
                            manual transcription
                        </span>
                    </h2>
                </div>

                {/* Animated Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <AnimatedStat
                            key={index}
                            value={stat.value}
                            suffix={stat.suffix}
                            label={stat.label}
                            icon={stat.icon}
                            isInView={isInView}
                            delay={200 + index * 150}
                        />
                    ))}
                </div>

                {/* Before/After Transformation - Improved Visual Design */}
                <div
                    className={cn(
                        "relative",
                        "transition-all duration-700 delay-500",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                >
                    {/* Connection arrow between boxes */}
                    <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/65 flex items-center justify-center shadow-xl shadow-primary/30 animate-pulse">
                            <ArrowRight className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20">
                        {/* Before - The Problem */}
                        <div className="relative p-8 rounded-2xl bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20 overflow-hidden">
                            {/* Decorative X pattern */}
                            <div className="absolute top-4 right-4 opacity-10">
                                <Xmark className="w-24 h-24 text-destructive" strokeWidth={1} />
                            </div>

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                                        <Xmark className="w-5 h-5 text-destructive" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {transformation.before.title}
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {transformation.before.items.map((item, i) => (
                                        <li
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-3",
                                                "transition-all duration-500",
                                                isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                                            )}
                                            style={{ transitionDelay: `${700 + i * 100}ms` }}
                                        >
                                            <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                                                <Xmark className="w-3 h-3 text-destructive" />
                                            </span>
                                            <span className="text-lg text-muted-foreground line-through decoration-destructive/30">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* After - The Solution */}
                        <div className="relative p-8 rounded-2xl bg-gradient-to-br from-success/5 to-success/10 border border-success/20 overflow-hidden">
                            {/* Decorative check pattern */}
                            <div className="absolute top-4 right-4 opacity-10">
                                <Check className="w-24 h-24 text-success" strokeWidth={1} />
                            </div>

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-success" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {transformation.after.title}
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {transformation.after.items.map((item, i) => (
                                        <li
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-3",
                                                "transition-all duration-500",
                                                isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                                            )}
                                            style={{ transitionDelay: `${700 + i * 100}ms` }}
                                        >
                                            <span className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-success" />
                                            </span>
                                            <span className="text-lg text-foreground font-medium">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Mobile arrow */}
                    <div className="md:hidden flex justify-center py-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/65 flex items-center justify-center shadow-lg rotate-90">
                            <ArrowRight className="w-5 h-5 text-primary-foreground" />
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div
                    className={cn(
                        "text-center mt-16",
                        "transition-all duration-700 delay-1000",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <CTAButton size="lg">
                        Start Transcribing Free
                    </CTAButton>
                    <p className="mt-4 text-muted-foreground text-sm">
                        No credit card required • 10 free transcriptions daily
                    </p>
                </div>
            </div>
        </section>
    );
}
