"use client";

import * as React from "react";
import Link from "next/link";
import { Upload, Sparks, Download, ArrowRight } from "iconoir-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui";

// Steps data
const steps = [
    {
        number: "1",
        title: "Upload",
        description: "Upload files, paste a YouTube link, or record directly from your microphone",
        icon: Upload,
        color: "from-violet-500 to-purple-600",
        bg: "bg-violet-500/10",
    },
    {
        number: "2",
        title: "Transcribe",
        description: "Whisper AI processes your file with speaker detection and timestamps.",
        icon: Sparks,
        color: "from-fuchsia-500 to-pink-600",
        bg: "bg-fuchsia-500/10",
    },
    {
        number: "3",
        title: "Review & Export",
        description: "Read, edit, and share your transcript. Export as TXT, SRT, DOCX, or PDF.",
        icon: Download,
        color: "from-cyan-500 to-blue-600",
        bg: "bg-cyan-500/10",
    },
];

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

export function HowItWorksSection() {
    const { ref: sectionRef, isInView } = useInView(0.2);

    return (
        <section id="how-it-works" className="relative py-24 scroll-mt-16 overflow-hidden" ref={sectionRef}>
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-primary/10 rounded-full uppercase tracking-wider">
                        How It Works
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        Simple as 1-2-3
                    </h2>
                </div>

                {/* Snake/Cascade Flow */}
                <div className="relative">
                    {/* SVG Curved Connectors */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="connector-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="rgb(217, 70, 239)" stopOpacity="0.5" />
                            </linearGradient>
                            <linearGradient id="connector-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgb(217, 70, 239)" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.5" />
                            </linearGradient>
                        </defs>
                        {/* Curve from step 1 to step 2 */}
                        <path
                            d="M 200 80 Q 400 80, 400 180 Q 400 280, 600 280"
                            fill="none"
                            stroke="url(#connector-gradient-1)"
                            strokeWidth="3"
                            strokeDasharray="8 4"
                            className={cn(
                                "transition-all duration-1000",
                                isInView ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {/* Curve from step 2 to step 3 */}
                        <path
                            d="M 600 330 Q 400 330, 400 430 Q 400 530, 200 530"
                            fill="none"
                            stroke="url(#connector-gradient-2)"
                            strokeWidth="3"
                            strokeDasharray="8 4"
                            className={cn(
                                "transition-all duration-1000 delay-500",
                                isInView ? "opacity-100" : "opacity-0"
                            )}
                        />
                    </svg>

                    {/* Step Cards - Staggered */}
                    <div className="relative space-y-12 md:space-y-16">
                        {steps.map((step, index) => (
                            <div
                                key={step.number}
                                className={cn(
                                    "relative transition-all duration-700",
                                    // Stagger: left, right, left
                                    index === 0 && "md:mr-auto md:ml-0",
                                    index === 1 && "md:ml-auto md:mr-0",
                                    index === 2 && "md:mr-auto md:ml-0",
                                    "md:max-w-sm",
                                    // Animation on scroll
                                    isInView
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-8"
                                )}
                                style={{ transitionDelay: `${index * 200}ms` }}
                            >
                                {/* Card */}
                                <div className={cn(
                                    "relative p-6 rounded-2xl border border-border/50",
                                    "bg-card shadow-sm",
                                    "hover-lift"
                                )}>
                                    {/* Number badge */}
                                    <div className={cn(
                                        "absolute -top-4 w-10 h-10 rounded-xl",
                                        "bg-gradient-to-br flex items-center justify-center",
                                        "text-white text-lg font-bold shadow-lg",
                                        step.color,
                                        index === 1 ? "right-6" : "left-6"
                                    )}>
                                        {step.number}
                                    </div>

                                    <div className="flex items-start gap-4 mt-4">
                                        {/* Icon */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                            step.bg
                                        )}>
                                            <step.icon className={cn(
                                                "w-6 h-6",
                                                step.number === "1" && "text-violet-500",
                                                step.number === "2" && "text-fuchsia-500",
                                                step.number === "3" && "text-cyan-500"
                                            )} />
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground mb-1">
                                                {step.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile connector arrow */}
                                {index < steps.length - 1 && (
                                    <div className="md:hidden flex justify-center py-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center",
                                            "bg-gradient-to-br",
                                            index === 0 ? "from-violet-500 to-fuchsia-500" : "from-fuchsia-500 to-cyan-500"
                                        )}>
                                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12l7 7 7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className={cn(
                    "text-center mt-20 transition-all duration-700 delay-700",
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                    <CTAButton size="sm">
                        Start Transcribing
                    </CTAButton>
                </div>
            </div>
        </section>
    );
}
