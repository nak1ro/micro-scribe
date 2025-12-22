import * as React from "react";
import { ArrowRight, Zap, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Bold statistics that grab attention
const stats = [
    { value: "98.5%", label: "Accuracy", icon: Sparkles },
    { value: "50+", label: "Languages", icon: Globe },
    { value: "5x", label: "Faster", icon: Zap },
];

// The transformation - what we solve
const transformation = {
    before: {
        title: "Hours of manual work",
        items: ["Typing word by word", "Missing key details", "Expensive human transcribers"],
    },
    after: {
        title: "Minutes with AI",
        items: ["Automatic speaker detection", "Perfect timestamps", "One-click export"],
    },
};

export function ProblemSolutionSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900" />

            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Floating orbs for depth */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Headline */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-violet-300 bg-violet-500/10 rounded-full border border-violet-500/20">
                        Why MicroScribe?
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                        Stop wasting time on
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            manual transcription
                        </span>
                    </h2>
                </div>

                {/* MASSIVE Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative group text-center p-8 rounded-2xl",
                                "bg-white/5 backdrop-blur-sm border border-white/10",
                                "hover:bg-white/10 hover:border-violet-500/30",
                                "transition-all duration-300"
                            )}
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10 transition-all duration-300" />

                            <div className="relative">
                                <stat.icon className="w-8 h-8 text-violet-400 mx-auto mb-4" />
                                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 tracking-tighter">
                                    {stat.value}
                                </div>
                                <div className="text-lg text-gray-400 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Before/After Transformation */}
                <div className="relative">
                    {/* Connection line between boxes */}
                    <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <ArrowRight className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
                        {/* Before - The Problem */}
                        <div className="relative p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
                            <div className="absolute -top-3 left-6 px-3 py-1 bg-red-500/20 text-red-300 text-sm font-medium rounded-full border border-red-500/30">
                                Before
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-4 mb-6">
                                {transformation.before.title}
                            </h3>
                            <ul className="space-y-4">
                                {transformation.before.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-red-400/60" />
                                        <span className="text-lg">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* After - The Solution */}
                        <div className="relative p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                            <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/30">
                                After
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-4 mb-6">
                                {transformation.after.title}
                            </h3>
                            <ul className="space-y-4">
                                {transformation.after.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <span className="text-lg">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Link
                        href="/auth?mode=signup"
                        className={cn(
                            "inline-flex items-center gap-2 px-8 py-4 rounded-full",
                            "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                            "text-white font-semibold text-lg",
                            "hover:from-violet-600 hover:to-fuchsia-600",
                            "shadow-lg shadow-violet-500/30",
                            "transition-all duration-300 hover:scale-105"
                        )}
                    >
                        Start Transcribing Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="mt-4 text-gray-400 text-sm">
                        No credit card required • 10 free transcriptions daily
                    </p>
                </div>
            </div>
        </section>
    );
}
