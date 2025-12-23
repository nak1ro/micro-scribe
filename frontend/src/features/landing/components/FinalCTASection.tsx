"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Shield, CreditCard } from "lucide-react";
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

export function FinalCTASection() {
    const { ref, isInView } = useInView(0.2);

    return (
        <section className="relative min-h-screen flex items-center py-12 overflow-hidden" ref={ref}>
            {/* Accent glow for CTA differentiation */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-accent/30 blur-3xl" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            {/* Top and bottom fades for smooth transition */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                {/* Heading */}
                <h2
                    className={cn(
                        "text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    {finalCTAContent.heading}
                </h2>

                {/* Subheading */}
                <p
                    className={cn(
                        "mt-4 text-lg text-muted-foreground max-w-2xl mx-auto",
                        "transition-all duration-700 delay-100",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    {finalCTAContent.subheading}
                </p>

                {/* CTA */}
                <div
                    className={cn(
                        "mt-8",
                        "transition-all duration-700 delay-200",
                        isInView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                    )}
                >
                    <Link href={finalCTAContent.cta.href}>
                        <Button size="lg" className="text-base px-8 py-6">
                            <Sparkles className="h-5 w-5 mr-2" />
                            {finalCTAContent.cta.label}
                        </Button>
                    </Link>
                </div>

                {/* Note */}
                <p
                    className={cn(
                        "mt-4 text-sm text-muted-foreground",
                        "transition-all duration-700 delay-300",
                        isInView ? "opacity-100" : "opacity-0"
                    )}
                >
                    {finalCTAContent.note}
                </p>

                {/* Trust badges */}
                <div
                    className={cn(
                        "mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground",
                        "transition-all duration-700 delay-400",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>No Credit Card Required</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
