"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { BillingInterval, pricingConfig } from "../data";

interface PricingCardProps {
    name: string;
    description: string;
    price: number;
    interval: BillingInterval;
    features: string[];
    cta: string;
    ctaHref: string;
    highlighted?: boolean;
    badge?: string;
}

// Individual pricing plan card with features and CTA
export function PricingCard({
    name,
    description,
    price,
    interval,
    features,
    cta,
    ctaHref,
    highlighted = false,
    badge,
}: PricingCardProps) {
    const isFree = price === 0;
    const displayPrice = price;
    const period = isFree ? "forever" : interval === "annual" ? "mo" : "month";

    return (
        <div
            className={cn(
                "relative rounded-2xl overflow-hidden bg-card",
                "border-2 transition-all duration-300",
                highlighted
                    ? "border-primary shadow-xl shadow-primary/20 md:scale-[1.02]"
                    : "border-border hover:border-muted-foreground/30 shadow-lg"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "px-6 py-6 text-center",
                    highlighted
                        ? "bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground"
                        : "bg-card border-b border-border"
                )}
            >
                {badge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
                        🔥 {badge}
                    </div>
                )}

                <h3
                    className={cn(
                        "text-sm font-medium mb-1",
                        highlighted ? "text-white/80" : "text-muted-foreground"
                    )}
                >
                    {name}
                </h3>

                <p
                    className={cn(
                        "text-xs mb-3",
                        highlighted ? "text-white/60" : "text-muted-foreground"
                    )}
                >
                    {description}
                </p>

                {/* Price */}
                <div className="flex items-baseline justify-center gap-1">
                    <span
                        className={cn(
                            "text-4xl sm:text-5xl font-bold",
                            highlighted ? "text-white" : "text-foreground"
                        )}
                    >
                        ${displayPrice}
                    </span>
                    <span
                        className={cn(
                            "text-base",
                            highlighted ? "text-white/70" : "text-muted-foreground"
                        )}
                    >
                        /{period}
                    </span>
                </div>

                {interval === "annual" && !isFree && (
                    <p
                        className={cn(
                            "text-xs mt-1",
                            highlighted ? "text-white/60" : "text-muted-foreground"
                        )}
                    >
                        Billed ${displayPrice * 12}/year
                    </p>
                )}
            </div>

            {/* Features */}
            <div className="bg-card px-6 py-6">
                <ul className="space-y-3 mb-6">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div
                                className={cn(
                                    "shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                                    highlighted ? "bg-primary/10" : "bg-muted"
                                )}
                            >
                                <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm text-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <Link href={ctaHref}>
                    <Button
                        variant={highlighted ? "default" : "outline"}
                        size="lg"
                        className={cn(
                            "w-full text-sm font-semibold",
                            highlighted && "bg-primary hover:bg-primary/90"
                        )}
                    >
                        {cta}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
