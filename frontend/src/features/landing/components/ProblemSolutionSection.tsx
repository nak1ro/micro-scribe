import * as React from "react";
import { Clock, DollarSign, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { problemSolutionContent } from "../data/content";

const iconMap = {
    Clock,
    DollarSign,
    XCircle,
};

export function ProblemSolutionSection() {
    return (
        <section className="bg-muted py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
                        The Problem
                    </h2>
                    <p className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                        {problemSolutionContent.heading}
                    </p>
                </div>

                {/* Problem/Solution Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {problemSolutionContent.items.map((item, index) => {
                        const Icon = iconMap[item.icon as keyof typeof iconMap];
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "relative p-6 rounded-xl",
                                    "bg-card border border-border",
                                    "shadow-card",
                                    "transition-all duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                                    "hover:-translate-y-1 hover:shadow-md"
                                )}
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                                    <Icon className="h-6 w-6 text-destructive" />
                                </div>

                                {/* Problem */}
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {item.problem}
                                </h3>

                                {/* Arrow divider */}
                                <div className="flex items-center gap-2 my-4">
                                    <div className="flex-1 h-px bg-border" />
                                    <ArrowRight className="h-4 w-4 text-primary" />
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                {/* Solution */}
                                <p className="text-muted-foreground">{item.solution}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
