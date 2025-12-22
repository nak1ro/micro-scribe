import * as React from "react";
import Link from "next/link";
import { Upload, Sparkles, Download, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Steps data - compact version
const steps = [
    {
        number: "1",
        title: "Upload",
        description: "Drag & drop any audio or video file",
        icon: Upload,
        color: "from-violet-500 to-purple-600",
        bg: "bg-violet-500/10",
    },
    {
        number: "2",
        title: "Transcribe",
        description: "AI processes with speaker detection",
        icon: Sparkles,
        color: "from-fuchsia-500 to-pink-600",
        bg: "bg-fuchsia-500/10",
    },
    {
        number: "3",
        title: "Export",
        description: "Download as TXT, SRT, DOCX or PDF",
        icon: Download,
        color: "from-cyan-500 to-blue-600",
        bg: "bg-cyan-500/10",
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative py-20 scroll-mt-16 overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />

            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Header - compact */}
                <div className="text-center mb-16">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-primary/10 rounded-full uppercase tracking-wider">
                        How It Works
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        Three simple steps
                    </h2>
                </div>

                {/* Horizontal Flow - Desktop */}
                <div className="hidden md:flex items-stretch justify-center gap-0">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            {/* Step Card */}
                            <div className="relative flex-1 max-w-xs group">
                                {/* Card */}
                                <div className={cn(
                                    "relative h-full p-8 rounded-3xl border border-border/50",
                                    "bg-card hover:border-primary/30 transition-all duration-300",
                                    "hover:shadow-lg hover:shadow-primary/5"
                                )}>
                                    {/* Number badge */}
                                    <div className={cn(
                                        "absolute -top-4 left-8 w-8 h-8 rounded-full",
                                        "bg-gradient-to-br flex items-center justify-center",
                                        "text-white text-sm font-bold shadow-lg",
                                        step.color
                                    )}>
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                                        step.bg
                                    )}>
                                        <step.icon className={cn(
                                            "w-8 h-8 text-transparent bg-clip-text bg-gradient-to-br",
                                            step.color
                                        )} style={{ stroke: "url(#gradient-" + step.number + ")" }} />
                                        <svg width="0" height="0">
                                            <defs>
                                                <linearGradient id={`gradient-${step.number}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={step.number === "1" ? "#8b5cf6" : step.number === "2" ? "#d946ef" : "#06b6d4"} />
                                                    <stop offset="100%" stopColor={step.number === "1" ? "#9333ea" : step.number === "2" ? "#ec4899" : "#3b82f6"} />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-foreground mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow connector */}
                            {index < steps.length - 1 && (
                                <div className="flex items-center px-2 text-muted-foreground/30">
                                    <ChevronRight className="w-8 h-8" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Mobile - Vertical compact */}
                <div className="md:hidden space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent" />
                            )}

                            <div className="flex items-start gap-4">
                                {/* Number + Icon */}
                                <div className={cn(
                                    "relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                    "bg-gradient-to-br shadow-lg",
                                    step.color
                                )}>
                                    <step.icon className="w-6 h-6 text-white" />
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background text-foreground text-xs font-bold flex items-center justify-center border border-border">
                                        {step.number}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="pt-1">
                                    <h3 className="text-lg font-bold text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Link
                        href="/auth?mode=signup"
                        className={cn(
                            "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                            "bg-gradient-to-r from-primary to-secondary",
                            "text-white font-semibold",
                            "hover:opacity-90 shadow-lg shadow-primary/25",
                            "transition-all duration-300 hover:scale-105"
                        )}
                    >
                        Get Started Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
