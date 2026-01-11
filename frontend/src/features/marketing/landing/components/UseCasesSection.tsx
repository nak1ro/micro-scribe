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
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full">
                        Who's it for
                    </span>
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
                                "hover-lift",
                                // Size variants for asymmetric layout
                                useCase.size === "large" && "md:col-span-2 md:row-span-2",
                                useCase.size === "medium" && "lg:col-span-2",
                                useCase.size === "small" && "col-span-1",
                                // Scroll animation
                                "transition-opacity duration-500",
                                isInView ? "opacity-100" : "opacity-0"
                            )}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={useCase.image}
                                    alt={useCase.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <h3 className={cn(
                                    "font-bold text-white mb-2",
                                    useCase.size === "large" ? "text-3xl" : "text-xl"
                                )}>
                                    {useCase.title}
                                </h3>
                                <p className={cn(
                                    "text-white/80 leading-relaxed",
                                    "opacity-0 group-hover:opacity-100",
                                    "transition-opacity duration-300",
                                    useCase.size === "large" ? "text-lg" : "text-sm"
                                )}>
                                    {useCase.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
