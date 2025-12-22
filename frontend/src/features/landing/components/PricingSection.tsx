"use client";

import * as React from "react";
import Link from "next/link";
import {
    Infinity,
    Upload,
    Sparkles,
    Zap,
    Clock,
    CheckCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui";
import {pricingContent} from "../data/content";
import {PricingToggle} from "@/features/pricing/components/PricingToggle";
import {BillingInterval} from "@/features/pricing/data";

// Icon mapping for features
const iconMap: Record<string, React.ElementType> = {
    Infinity,
    Upload,
    Sparkles,
    Zap,
    Clock,
    CheckCircle,
};

export function PricingSection() {
    const [billingInterval, setBillingInterval] = React.useState<BillingInterval>("monthly");

    return (
        <section id="pricing" className="relative min-h-screen flex items-center py-12 scroll-mt-16 overflow-hidden">
            {/* Dot grid pattern overlay with fade masks for smooth transition */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Dot grid */}
                <div className="absolute inset-0 bg-dot-grid"/>
                {/* Top fade - transitions from previous section */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent"/>
                {/* Bottom fade - transitions to next section */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"/>
            </div>

            {/* Slightly stronger glow to emphasize pricing */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/8 blur-3xl"/>
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                        {pricingContent.heading}
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground">
                        {pricingContent.subheading}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-10">
                    <PricingToggle value={billingInterval} onChange={setBillingInterval}/>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                    {pricingContent.tiers.map((tier, index) => {
                        const isPro = tier.highlighted;


                        const price = isPro ? (billingInterval === "monthly" ? tier.priceMonthly : tier.priceAnnual) : tier.price;
                        const priceLabel = isPro ? (billingInterval === "monthly" ? tier.priceLabelMonthly : tier.priceLabelAnnual) : tier.priceLabel;

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "relative rounded-2xl overflow-hidden bg-card",
                                    "shadow-lg hover:shadow-xl transition-shadow duration-300",
                                    isPro && "md:scale-[1.02]"
                                )}
                            >
                                {/* Header with gradient for Pro */}
                                <div
                                    className={cn(
                                        "px-6 py-6 text-center",
                                        isPro
                                            ? "bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground"
                                            : "bg-card border-b border-border"
                                    )}
                                >
                                    <h3
                                        className={cn(
                                            "text-sm font-medium mb-2",
                                            isPro ? "text-white/80" : "text-muted-foreground"
                                        )}
                                    >
                                        {tier.name}
                                        {isPro && " – " + tier.description}
                                    </h3>

                                    {/* Price */}
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span
                                            className={cn(
                                                "text-4xl sm:text-5xl font-bold",
                                                isPro ? "text-white" : "text-foreground"
                                            )}
                                        >
                                            {price}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-base",
                                                isPro ? "text-white/70" : "text-muted-foreground"
                                            )}
                                        >
                                            {tier.period}
                                        </span>
                                    </div>

                                    {priceLabel && (
                                        <p
                                            className={cn(
                                                "text-xs mt-1",
                                                isPro ? "text-white/60" : "text-muted-foreground"
                                            )}
                                        >
                                            {priceLabel}
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="bg-card px-6 py-6">
                                    <div className="space-y-5 mb-6">
                                        {tier.features.map((feature, featureIndex) => {
                                            const Icon = iconMap[feature.icon] || CheckCircle;
                                            return (
                                                <div key={featureIndex} className="flex items-start gap-3">
                                                    <div
                                                        className={cn(
                                                            "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                                                            isPro ? "bg-primary/10" : "bg-muted"
                                                        )}
                                                    >
                                                        <Icon
                                                            className={cn(
                                                                "h-5 w-5",
                                                                "text-primary"
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {feature.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {feature.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* CTA */}
                                    <Link href={tier.cta.href}>
                                        <Button
                                            variant={isPro ? "default" : "outline"}
                                            size="lg"
                                            className={cn(
                                                "w-full text-sm font-semibold uppercase tracking-wide",
                                                isPro && "bg-primary hover:bg-primary/90"
                                            )}
                                        >
                                            {tier.cta.label}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success"/>
                        <span>Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success"/>
                        <span>No Credit Card Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success"/>
                        <span>Cancel Anytime</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
