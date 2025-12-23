"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function HeroSection() {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [visibleLines, setVisibleLines] = React.useState(0);
    const [mounted, setMounted] = React.useState(false);

    // Trigger entrance animation after mount
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Simulate transcript appearing as audio "plays"
    React.useEffect(() => {
        if (!isPlaying) return;

        const timer = setInterval(() => {
            setCurrentTime((prev) => {
                if (prev >= 18) {
                    setIsPlaying(false);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying]);

    // Show transcript lines based on current time
    React.useEffect(() => {
        if (currentTime >= 12) setVisibleLines(3);
        else if (currentTime >= 6) setVisibleLines(2);
        else if (currentTime >= 1) setVisibleLines(1);
        else setVisibleLines(0);
    }, [currentTime]);

    const handlePlayClick = () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            setCurrentTime(0);
            setVisibleLines(0);
            setIsPlaying(true);
        }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Subtle gradient accents */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-40" />

            <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
                {/* Tiny accent - stagger delay 0 */}
                <div
                    className={cn(
                        "inline-flex items-center gap-1.5 text-primary text-sm font-medium mb-8 opacity-80",
                        "transition-all duration-700",
                        mounted ? "opacity-80 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <Sparkles className="h-4 w-4" />
                    <span>Powered by Whisper AI</span>
                </div>

                {/* Headline - stagger delay 100ms */}
                <h1
                    className={cn(
                        "text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]",
                        "transition-all duration-700 delay-100",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    Your audio.
                    <br />
                    <span className="text-primary">As searchable text.</span>
                </h1>

                {/* Subheadline - stagger delay 200ms */}
                <p
                    className={cn(
                        "mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed",
                        "transition-all duration-700 delay-200",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    Upload any recording. Get an accurate transcript in minutes.
                    <br className="hidden sm:block" />
                    Edit it. Search it. Share it.
                </p>

                {/* Single focused CTA - stagger delay 300ms */}
                <div
                    className={cn(
                        "mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center",
                        "transition-all duration-700 delay-300",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <Link href="/auth?mode=signup">
                        <Button size="lg" className="text-base px-8 h-12 gap-2 group">
                            Start transcribing
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <span className="text-sm text-muted-foreground">
                        Free to start · No credit card
                    </span>
                </div>

                {/* Interactive audio player + transcript demo - stagger delay 500ms */}
                <div
                    className={cn(
                        "mt-16 relative",
                        "transition-all duration-700 delay-500",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                >
                    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden max-w-2xl mx-auto">
                        {/* Audio player bar */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
                            {/* Play button */}
                            <button
                                onClick={handlePlayClick}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                    isPlaying
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4 ml-0.5" />
                                )}
                            </button>

                            {/* Waveform visualization */}
                            <div className="flex-1 flex items-center gap-0.5 h-8">
                                {Array.from({ length: 50 }).map((_, i) => {
                                    const progress = currentTime / 18;
                                    const barProgress = i / 50;
                                    const isActive = barProgress <= progress;
                                    // Deterministic pseudo-random using sine waves
                                    const seed = Math.sin(i * 12.9898) * 43758.5453;
                                    const random = (seed - Math.floor(seed)) * 10;
                                    const height = Math.round((20 + Math.sin(i * 0.5) * 15 + random) * 100) / 100;

                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                "w-1 rounded-full transition-all duration-150",
                                                isActive ? "bg-primary" : "bg-muted-foreground/30"
                                            )}
                                            style={{ height: `${height}%` }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Time */}
                            <span className="text-xs font-mono text-muted-foreground min-w-[40px]">
                                0:{currentTime.toString().padStart(2, "0")}
                            </span>
                        </div>

                        {/* Transcript preview */}
                        <div className="p-5 text-left space-y-3 min-h-[180px]">
                            <TranscriptLine
                                time="0:00"
                                speaker="Host"
                                text="Welcome back to the show. Today we're talking about productivity."
                                color="primary"
                                visible={visibleLines >= 1}
                            />
                            <TranscriptLine
                                time="0:06"
                                speaker="Guest"
                                text="Thanks for having me! I've been researching this for years..."
                                color="secondary"
                                visible={visibleLines >= 2}
                            />
                            <TranscriptLine
                                time="0:12"
                                speaker="Host"
                                text="Let's dive right in. What's the biggest mistake people make?"
                                color="primary"
                                visible={visibleLines >= 3}
                            />

                            {/* Typing indicator when playing */}
                            {isPlaying && visibleLines < 3 && (
                                <div className="flex items-center gap-2 pt-2 animate-in fade-in duration-300">
                                    <span className="text-xs text-muted-foreground">Transcribing</span>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}

                            {/* Prompt to play if not started */}
                            {!isPlaying && visibleLines === 0 && (
                                <div className="flex items-center justify-center h-full py-8 text-muted-foreground text-sm">
                                    Click play to see transcription in action →
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating stat */}
                    <div className="absolute -bottom-4 right-4 sm:right-12 px-3 py-1.5 rounded-full bg-card border border-border shadow-md text-sm">
                        <span className="text-muted-foreground">50+ languages</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Helper component for transcript lines
function TranscriptLine({
    time,
    speaker,
    text,
    color,
    visible,
}: {
    time: string;
    speaker: string;
    text: string;
    color: "primary" | "secondary";
    visible: boolean;
}) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
    };

    if (!visible) return null;

    return (
        <div className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-xs mb-1">
                <span className={cn("px-1.5 py-0.5 rounded font-mono", colorClasses[color])}>
                    {time}
                </span>
                <span className="text-muted-foreground font-medium">{speaker}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-0.5">
                {text}
            </p>
        </div>
    );
}
