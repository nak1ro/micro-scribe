"use client";

import * as React from "react";
import { CheckCircle } from "iconoir-react";
import { cn } from "@/lib/utils";
import { pricingContent } from "../data/content";
import { PricingToggle } from "@/features/marketing/pricing/components/PricingToggle";
import { PricingCard } from "@/features/marketing/pricing/components/PricingCard";
import { BillingInterval } from "@/features/marketing/pricing/data";
import { useInView } from "@/hooks";

export function PricingSection() {
    const [billingInterval, setBillingInterval] = React.useState<BillingInterval>("monthly");
    const { ref, isInView } = useInView(0.15);

    return (
        <section
            id="pricing"
            className="relative py-24 scroll-mt-16 overflow-hidden"
            ref={ref}
        >
            {/* Left decorative elements */}
            <div className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6 opacity-40">
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDuration: "2s" }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border border-primary/40 animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-3 rounded-full bg-primary/30" />
                </div>
                <div className="w-2 h-2 rounded-full bg-secondary/50 animate-bounce" style={{ animationDuration: "2.2s", animationDelay: "0.5s" }} />
            </div>

            {/* Right decorative elements */}
            <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6 opacity-40">
                <div className="w-2 h-2 rounded-full bg-secondary/50 animate-bounce" style={{ animationDuration: "2.3s" }} />
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border border-secondary/40 animate-ping" style={{ animationDuration: "3.5s" }} />
                    <div className="absolute inset-3 rounded-full bg-secondary/30" />
                </div>
                <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDuration: "2s", animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDuration: "2.6s", animationDelay: "0.4s" }} />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div
                    className={cn(
                        "text-center mb-10 transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                        {pricingContent.heading}
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground">
                        {pricingContent.subheading}
                    </p>
                </div>

                {/* Toggle */}
                <div
                    className={cn(
                        "flex justify-center mb-10 transition-all duration-700 delay-100",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <PricingToggle value={billingInterval} onChange={setBillingInterval} />
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                    {pricingContent.tiers.map((tier, index) => {
                        const isPro = tier.highlighted;
                        const price = isPro
                            ? (billingInterval === "monthly" ? tier.priceMonthly : tier.priceAnnual)
                            : tier.price;
                        const priceLabel = isPro
                            ? (billingInterval === "monthly" ? tier.priceLabelMonthly : tier.priceLabelAnnual)
                            : tier.priceLabel;

                        return (
                            <PricingCard
                                key={index}
                                name={tier.name}
                                description={tier.description}
                                price={price || "$0"}
                                period={tier.period}
                                priceLabel={priceLabel}
                                features={tier.features}
                                cta={tier.cta}
                                highlighted={isPro}

                            />
                        );
                    })}
                </div>

                {/* Trust Badges */}
                <div
                    className={cn(
                        "mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground",
                        "transition-all duration-700 delay-500",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>No Credit Card Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Cancel Anytime</span>
                    </div>
                </div>
            </div>
        </section>
    );
}