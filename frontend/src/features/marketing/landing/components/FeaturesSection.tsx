"use client";

import * as React from "react";
import { Check, Sparks, MagicWand, Page, Clock, Group, Language } from "iconoir-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui";
import { useInView } from "@/hooks";
import Image from "next/image";

// Primary features with mockup images - zigzag layout
const primaryFeatures = [
    {
        id: "transcribe",
        title: "Transcribe in seconds",
        subtitle: "Lightning fast AI",
        description:
            "Upload any file — get accurate transcripts with timestamps and speaker labels in minutes.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
        checks: [
            "Automatic speaker detection",
            "Word-level timestamps",
            "Background noise removal",
        ],
    },
    {
        id: "edit",
        title: "Edit with precision",
        subtitle: "Smart inline editor",
        description:
            "Click any word to jump to that moment. Make corrections with synchronized playback.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
        checks: [
            "Click-to-seek audio sync",
            "Inline editing",
            "Version history",
        ],
    },
    {
        id: "export",
        title: "Export anywhere",
        subtitle: "Multiple formats",
        description:
            "Download transcripts in any format — perfect for subtitles, docs, or further processing.",
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&q=80",
        checks: [
            "SRT, VTT, TXT, DOCX, PDF",
            "Custom timestamps",
            "One-click download",
        ],
    },
];

// Secondary features - checklist style
const secondaryFeatures = [
    { icon: Sparks, text: "AI-powered summaries" },
    { icon: MagicWand, text: "Automatic punctuation" },
    { icon: Page, text: "Searchable transcripts" },
    { icon: Clock, text: "Real-time processing" },
    { icon: Group, text: "Team collaboration" },
    { icon: Language, text: "Translation to 30+ languages" },
];

export function FeaturesSection() {
    const { ref, isInView } = useInView(0.1);

    return (
        <section className="relative py-24 overflow-hidden" ref={ref}>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div
                    className={cn(
                        "text-center mb-20",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full">
                        Powerful Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                        Everything you need,
                        <br />
                        <span className="text-muted-foreground">nothing you don&apos;t</span>
                    </h2>
                </div>

                {/* Primary Features - Zigzag Layout */}
                <div className="space-y-32 mb-32">
                    {primaryFeatures.map((feature, index) => (
                        <div
                            key={feature.id}
                            className={cn(
                                "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
                                index % 2 === 1 && "lg:grid-flow-dense",
                                "transition-all duration-700",
                                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                            style={{ transitionDelay: `${200 + index * 150}ms` }}
                        >
                            {/* Content */}
                            <div className={cn(index % 2 === 1 && "lg:col-start-2")}>
                                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                    {feature.subtitle}
                                </span>
                                <h3 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                    {feature.description}
                                </p>
                                {/* Checkmarks */}
                                <ul className="space-y-3">
                                    {feature.checks.map((check, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-foreground">{check}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Image/Mockup */}
                            <div className={cn(
                                "relative",
                                index % 2 === 1 && "lg:col-start-1"
                            )}>
                                {/* Device frame */}
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-card border border-border">
                                    {/* Browser chrome */}
                                    <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="w-full max-w-xs h-6 rounded-md bg-background border border-border" />
                                        </div>
                                    </div>
                                    {/* Screenshot */}
                                    <div className="relative aspect-[16/10]">
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Overlay gradient for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
                                    </div>
                                </div>
                                {/* Floating decoration */}
                                <div className={cn(
                                    "absolute -z-10 w-full h-full rounded-2xl",
                                    "bg-gradient-to-br from-primary/20 to-primary/10",
                                    index % 2 === 0 ? "-bottom-4 -right-4" : "-bottom-4 -left-4"
                                )} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Languages Section - Simplified */}
                <div className="mb-20">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                            Transcribe in <span className="text-primary">100+ languages</span>
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Powered by OpenAI Whisper for industry-leading accuracy
                        </p>

                        {/* Popular language flags */}
                        <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                            {["🇬🇧 English", "🇪🇸 Spanish", "🇫🇷 French", "🇩🇪 German", "🇨🇳 Chinese"].map((lang) => (
                                <span
                                    key={lang}
                                    className="px-3 py-1.5 text-sm bg-card border border-border rounded-full text-foreground"
                                >
                                    {lang}
                                </span>
                            ))}
                            <span className="px-3 py-1.5 text-sm bg-primary/10 border border-primary/20 rounded-full text-primary font-medium">
                                +95 more
                            </span>
                        </div>
                    </div>
                </div>

                {/* Secondary Features - Grid with collapse */}
                <div className="mt-12">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-foreground">
                            And much more...
                        </h3>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <CTAButton size="lg">
                        Start Transcribing Free
                    </CTAButton>
                    <p className="mt-4 text-muted-foreground text-sm">
                        No credit card required
                    </p>
                </div>
            </div>
        </section>
    );
}
