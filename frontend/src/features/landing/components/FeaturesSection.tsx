import * as React from "react";
import { Check, Sparkles, Wand2, FileText, Clock, Users, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Primary features with mockup images - zigzag layout
const primaryFeatures = [
    {
        id: "transcribe",
        title: "Transcribe in seconds",
        subtitle: "Lightning fast AI",
        description:
            "Upload any audio or video file and get accurate transcripts with timestamps and speaker labels. Our AI handles accents, background noise, and multiple speakers with ease.",
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
            "Click any word to jump to that exact moment in the audio. Make corrections seamlessly with our synchronized playback view.",
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
            "Download your transcripts in any format you need. Perfect for subtitles, documentation, or further processing.",
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&q=80",
        checks: [
            "SRT, VTT, TXT, DOCX, PDF",
            "Custom timestamps",
            "One-click download",
        ],
    },
];

// Languages grid with flags
const languages = [
    { code: "US", name: "English" },
    { code: "ES", name: "Spanish" },
    { code: "FR", name: "French" },
    { code: "DE", name: "German" },
    { code: "IT", name: "Italian" },
    { code: "PT", name: "Portuguese" },
    { code: "JP", name: "Japanese" },
    { code: "KR", name: "Korean" },
    { code: "CN", name: "Chinese" },
    { code: "RU", name: "Russian" },
    { code: "AR", name: "Arabic" },
    { code: "NL", name: "Dutch" },
];

// Secondary features - checklist style
const secondaryFeatures = [
    { icon: Sparkles, text: "AI-powered summaries" },
    { icon: Wand2, text: "Automatic punctuation" },
    { icon: FileText, text: "Searchable transcripts" },
    { icon: Clock, text: "Real-time processing" },
    { icon: Users, text: "Team collaboration" },
    { icon: Languages, text: "Translation to 30+ languages" },
];

export function FeaturesSection() {
    return (
        <section className="relative py-24 overflow-hidden bg-background">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
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
                                index % 2 === 1 && "lg:grid-flow-dense"
                            )}
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
                                    "bg-gradient-to-br from-primary/20 to-secondary/20",
                                    index % 2 === 0 ? "-bottom-4 -right-4" : "-bottom-4 -left-4"
                                )} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Languages Grid */}
                <div className="text-center mb-20">
                    <h3 className="text-2xl font-bold text-foreground mb-8">
                        Transcribe in <span className="text-primary">50+ languages</span>
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                        {languages.map((lang) => (
                            <div
                                key={lang.code}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                                    "bg-card border border-border",
                                    "hover:border-primary/50 hover:bg-primary/5",
                                    "transition-colors duration-200"
                                )}
                            >
                                {/* Flag emoji placeholder - using country code */}
                                <span className="text-lg">
                                    {lang.code === "US" && "🇺🇸"}
                                    {lang.code === "ES" && "🇪🇸"}
                                    {lang.code === "FR" && "🇫🇷"}
                                    {lang.code === "DE" && "🇩🇪"}
                                    {lang.code === "IT" && "🇮🇹"}
                                    {lang.code === "PT" && "🇧🇷"}
                                    {lang.code === "JP" && "🇯🇵"}
                                    {lang.code === "KR" && "🇰🇷"}
                                    {lang.code === "CN" && "🇨🇳"}
                                    {lang.code === "RU" && "🇷🇺"}
                                    {lang.code === "AR" && "🇸🇦"}
                                    {lang.code === "NL" && "🇳🇱"}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {lang.name}
                                </span>
                            </div>
                        ))}
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            + 38 more
                        </div>
                    </div>
                </div>

                {/* Secondary Features - Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {secondaryFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group flex flex-col items-center text-center p-6 rounded-xl",
                                "bg-card border border-border",
                                "hover:border-primary/30 hover:bg-primary/5",
                                "transition-all duration-300"
                            )}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
