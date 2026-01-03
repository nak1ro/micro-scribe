"use client";

import * as React from "react";
import {
    Infinite,
    Upload,
    Sparks,
    Flash,
    Clock,
    CheckCircle,
    Download,
    Group,
} from "iconoir-react";
import { cn } from "@/lib/utils";
import { PricingButton } from "./PricingButton";

// Icon mapping for features - using Iconoir icons
const iconMap: Record<string, React.ElementType> = {
    Infinity: Infinite,
    Upload,
    Sparkles: Sparks,
    Zap: Flash,
    Clock,
    CheckCircle,
    Download,
    Users: Group,
};

export interface PricingFeature {
    icon: string;
    text: string;
}

export interface PricingCardProps {
    name: string;
    description?: string;
    price: string;
    period?: string;
    priceLabel?: string;
    features: PricingFeature[];
    cta: {
        label: string;
        href: string;
    };
    highlighted?: boolean;
    // Animation support for landing page
    animationClass?: string;
    animationDelay?: string;
}

// Reusable pricing card component - used on landing page and pricing page
export function PricingCard({
    name,
    description,
    price,
    period,
    priceLabel,
    features,
    cta,
    highlighted = false,
    animationClass,
    animationDelay,
}: PricingCardProps) {
    return (
        <div
            className={cn(
                "relative rounded-2xl bg-card shadow-lg",
                "border border-border/50",
                // Hover glow effect using box-shadow
                "hover:border-primary/50",
                highlighted
                    ? "hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
                    : "hover:shadow-[0_0_25px_hsl(var(--primary)/0.25)]",
                "transition-all duration-300",
                animationClass
            )}
            style={animationDelay ? { transitionDelay: animationDelay } : undefined}
        >
            {/* Header with gradient for highlighted/Pro */}
            <div
                className={cn(
                    "px-6 py-6 text-center rounded-t-2xl",
                    highlighted
                        ? "bg-gradient-to-br from-primary to-primary/65 text-primary-foreground"
                        : "bg-card border-b border-border"
                )}
            >
                <h3
                    className={cn(
                        "text-sm font-medium mb-2",
                        highlighted ? "text-white/80" : "text-muted-foreground"
                    )}
                >
                    {name}
                    {highlighted && description && " – " + description}
                </h3>

                {/* Price */}
                <div className="flex items-baseline justify-center gap-1">
                    <span
                        className={cn(
                            "text-4xl sm:text-5xl font-bold",
                            highlighted ? "text-white" : "text-foreground"
                        )}
                    >
                        {price}
                    </span>
                    {period && (
                        <span
                            className={cn(
                                "text-base",
                                highlighted ? "text-white/70" : "text-muted-foreground"
                            )}
                        >
                            {period}
                        </span>
                    )}
                </div>

                {priceLabel && (
                    <p
                        className={cn(
                            "text-xs mt-1",
                            highlighted ? "text-white/60" : "text-muted-foreground"
                        )}
                    >
                        {priceLabel}
                    </p>
                )}
            </div>

            {/* Features */}
            <div className="bg-card px-6 py-6 rounded-b-2xl">
                <div className="space-y-5 mb-6">
                    {features.map((feature, index) => {
                        const Icon = iconMap[feature.icon] || CheckCircle;
                        return (
                            <div key={index} className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                                        highlighted ? "bg-primary/10" : "bg-muted"
                                    )}
                                >
                                    <Icon
                                        width={24}
                                        height={24}
                                        className="text-primary"
                                    />
                                </div>
                                <p className="flex-1 text-sm text-foreground">
                                    {feature.text}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <PricingButton href={cta.href} highlighted={highlighted}>
                    {cta.label}
                </PricingButton>
            </div>
        </div>
    );
}
