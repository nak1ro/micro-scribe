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
        <section className="py-16 sm:py-20 bg-accent/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        {featuresContent.heading}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {featuresContent.subheading}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {featuresContent.features.map((feature, index) => {
                        const Icon = iconMap[feature.icon as keyof typeof iconMap];
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "p-6 rounded-xl",
                                    "bg-card border border-border",
                                    "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
                                    "transition-all duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                                    "hover:-translate-y-1 hover:shadow-md hover:border-primary/20"
                                )}
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
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
