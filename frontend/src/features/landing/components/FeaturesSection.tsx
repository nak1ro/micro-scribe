import * as React from "react";
import {
    Zap,
    Target,
    Bot,
    Globe,
    Languages,
    Edit3,
    Download,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { featuresContent } from "../data/content";

const iconMap = {
    Zap,
    Target,
    Bot,
    Globe,
    Languages,
    Edit3,
    Download,
    Clock,
};

export function FeaturesSection() {
    return (
        <section className="relative min-h-screen flex items-center py-12 overflow-hidden">
            {/* Inner glow decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                        {featuresContent.heading}
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground">
                        {featuresContent.subheading}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featuresContent.features.map((feature, index) => {
                        const Icon = iconMap[feature.icon as keyof typeof iconMap];
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "p-4 rounded-xl",
                                    "bg-card border border-border",
                                    "shadow-card",
                                    "transition-all duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                                    "hover:-translate-y-1 hover:shadow-md hover:border-primary/20"
                                )}
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
