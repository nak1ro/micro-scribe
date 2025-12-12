import * as React from "react";
import {
    Mic,
    GraduationCap,
    Briefcase,
    Newspaper,
    BookOpen,
    Accessibility,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCasesContent } from "../data/content";

const iconMap = {
    Mic,
    GraduationCap,
    Briefcase,
    Newspaper,
    BookOpen,
    Accessibility,
};

export function UseCasesSection() {
    return (
        <section className="relative min-h-screen flex items-center py-12 overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-secondary/5 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                        {useCasesContent.heading}
                    </h2>
                </div>

                {/* Use Cases Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {useCasesContent.cases.map((useCase, index) => {
                        const Icon = iconMap[useCase.icon as keyof typeof iconMap];
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "p-4 rounded-xl",
                                    "bg-card border border-border",
                                    "shadow-card",
                                    "transition-all duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                                    "hover:-translate-y-1 hover:shadow-md"
                                )}
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                                    <Icon className="h-6 w-6 text-secondary" />
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {useCase.title}
                                </h3>

                                {/* Description */}
                                <p className="text-muted-foreground">{useCase.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
