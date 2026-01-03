"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks";
import Image from "next/image";

// Use cases with real stock photos - asymmetric bento grid
const useCases = [
    {
        id: "podcasters",
        title: "Podcasters",
        description: "Turn episodes into show notes, blogs, and social content",
        image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
        size: "large",
        accent: "from-violet-500/80 to-fuchsia-500/80",
    },
    {
        id: "students",
        title: "Students",
        description: "Never miss a lecture again",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
        size: "small",
        accent: "from-blue-500/80 to-cyan-500/80",
    },
    {
        id: "journalists",
        title: "Journalists",
        description: "Transcribe interviews in minutes",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
        size: "small",
        accent: "from-amber-500/80 to-orange-500/80",
    },
    {
        id: "business",
        title: "Business Teams",
        description: "Meeting notes and action items, automatically",
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
        size: "large",
        accent: "from-emerald-500/80 to-teal-500/80",
    },
    {
        id: "researchers",
        title: "Researchers",
        description: "Analyze hours of interviews with searchable text",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
        size: "medium",
        accent: "from-rose-500/80 to-pink-500/80",
    },
    {
        id: "creators",
        title: "Content Creators",
        description: "YouTube captions and repurpose content",
        image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&q=80",
        size: "medium",
        accent: "from-indigo-500/80 to-purple-500/80",
    },
];

export function UseCasesSection() {
    const { ref, isInView } = useInView(0.1);

    return (
        <section className="relative py-24 overflow-hidden" ref={ref}>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div
                    className={cn(
                        "text-center mb-16",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                        Built for{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/65">
                            everyone
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From solo creators to enterprise teams, ScribeRocket adapts to your workflow
                    </p>
                </div>

                {/* Bento Grid - Asymmetric Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                    {useCases.map((useCase, index) => (
                        <div
                            key={useCase.id}
                            className={cn(
                                "group relative rounded-2xl overflow-hidden cursor-pointer",
                                "hover:scale-[1.02] hover:shadow-2xl",
                                // Size variants for asymmetric layout
                                useCase.size === "large" && "md:col-span-2 md:row-span-2",
                                useCase.size === "medium" && "lg:col-span-2",
                                useCase.size === "small" && "col-span-1",
                                // Scroll animation
                                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                            style={{
                                transition: `opacity 700ms ${150 + index * 100}ms, transform 700ms ${150 + index * 100}ms, box-shadow 500ms, scale 500ms`,
                            }}
                        >
                            {/* Background Image with Grayscale */}
                            <div className="absolute inset-0">
                                <Image
                                    src={useCase.image}
                                    alt={useCase.title}
                                    fill
                                    className={cn(
                                        "object-cover",
                                        "grayscale group-hover:grayscale-0",
                                        "scale-105 group-hover:scale-100",
                                        "transition-all duration-700"
                                    )}
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div
                                className={cn(
                                    "absolute inset-0",
                                    "bg-gradient-to-t from-black/90 via-black/50 to-transparent",
                                    "group-hover:from-black/70 group-hover:via-transparent",
                                    "transition-all duration-500"
                                )}
                            />

                            {/* Color Accent Overlay on Hover */}
                            <div
                                className={cn(
                                    "absolute inset-0 opacity-0 group-hover:opacity-30",
                                    "bg-gradient-to-br",
                                    useCase.accent,
                                    "transition-opacity duration-500"
                                )}
                            />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <h3 className={cn(
                                    "font-bold text-white mb-2",
                                    "transform group-hover:-translate-y-1 transition-transform duration-300",
                                    useCase.size === "large" ? "text-3xl" : "text-xl"
                                )}>
                                    {useCase.title}
                                </h3>
                                <p className={cn(
                                    "text-white/80 leading-relaxed",
                                    "transform translate-y-4 opacity-0",
                                    "group-hover:translate-y-0 group-hover:opacity-100",
                                    "transition-all duration-300 delay-100",
                                    useCase.size === "large" ? "text-lg" : "text-sm"
                                )}>
                                    {useCase.description}
                                </p>
                            </div>

                            {/* Corner accent */}
                            <div className={cn(
                                "absolute top-4 right-4 w-3 h-3 rounded-full",
                                "bg-gradient-to-br",
                                useCase.accent,
                                "opacity-0 group-hover:opacity-100",
                                "transition-opacity duration-300"
                            )} />
                        </div>
                    ))}
                </div>

                {/* Bottom tagline */}
                <div className="text-center mt-12">
                    <p className="text-muted-foreground">
                        From solo creators to enterprise teams, ScribeRocket adapts to your workflow
                    </p>
                </div>
            </div>
        </section>
    );
}
