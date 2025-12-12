"use client";

import * as React from "react";
import Link from "next/link";
import { Mic2, Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { heroContent, siteConfig } from "../data/content";

export function HeroSection() {
    return (
        <section className="relative overflow-visible">
            {/* Background glow - stronger for hero */}
            <div className="absolute inset-0 overflow-visible pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/15 blur-3xl" />
                {/* This glow extends into the next section for smooth transition */}
                <div className="absolute -bottom-16 right-1/4 w-[500px] h-[400px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-8 lg:pt-20 lg:pb-36">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left Column - Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <Mic2 className="h-4 w-4" />
                            <span>Powered by OpenAI Whisper</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            {heroContent.headline}
                        </h1>

                        {/* Subheadline */}
                        <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0">
                            {heroContent.subheadline}
                        </p>

                        {/* CTAs */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href={heroContent.primaryCTA.href}>
                                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                                    {heroContent.primaryCTA.label}
                                </Button>
                            </Link>
                            <Link href={heroContent.secondaryCTA.href}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto text-base px-8"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    {heroContent.secondaryCTA.label}
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
                            {heroContent.trustBadges.map((badge, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span>{badge}</span>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                            {heroContent.stats.map((stat, index) => (
                                <div key={index} className="text-center lg:text-left">
                                    <div className="text-2xl sm:text-3xl font-bold text-foreground">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Product Mockup */}
                    <div className="relative">
                        <div
                            className={cn(
                                "relative rounded-2xl overflow-hidden",
                                "bg-card border border-border shadow-2xl shadow-primary/10"
                            )}
                        >
                            {/* Mockup Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-destructive/70" />
                                    <div className="w-3 h-3 rounded-full bg-warning" />
                                    <div className="w-3 h-3 rounded-full bg-success" />
                                </div>
                                <div className="flex-1 text-center text-sm text-muted-foreground">
                                    {siteConfig.name}
                                </div>
                            </div>

                            {/* Mockup Content */}
                            <div className="p-6 space-y-4">
                                {/* File upload area placeholder */}
                                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                        <Mic2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Drop your audio file here
                                    </p>
                                </div>

                                {/* Fake transcription result */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                            00:00
                                        </span>
                                        <span>Speaker 1</span>
                                    </div>
                                    <p className="text-sm text-foreground">
                                        Welcome to today's episode where we'll be discussing the
                                        future of AI in everyday applications...
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-medium">
                                            00:15
                                        </span>
                                        <span>Speaker 2</span>
                                    </div>
                                    <p className="text-sm text-foreground">
                                        That's right! Let's dive into how transcription technology
                                        has evolved...
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-lg bg-card border border-border shadow-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="text-sm font-medium">Processing complete</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
