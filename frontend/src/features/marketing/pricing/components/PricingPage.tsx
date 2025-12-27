"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
    BillingInterval,
    pricingHeroContent,
    pricingConfig,
    planCardContent,
    pricingFAQContent,
    pricingCTAContent,
} from "../data";
import { PricingToggle } from "./PricingToggle";
import { PricingCard } from "./PricingCard";
import { FeatureComparisonTable } from "./FeatureComparisonTable";
import { PricingFAQ } from "./PricingFAQ";
import { TrustBadges } from "./TrustBadges";

// Main pricing page component with all sections
export function PricingPage() {
    const [interval, setInterval] = React.useState<BillingInterval>("monthly");

    const freePrice = pricingConfig[interval].free;
    const proPrice = pricingConfig[interval].pro;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-16 sm:py-24 overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-dot-grid opacity-50" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                            {pricingHeroContent.headline}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {pricingHeroContent.subheadline}
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="mb-12">
                        <PricingToggle value={interval} onChange={setInterval} />
                    </div>

                    {/* Plan Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <PricingCard
                            name={planCardContent.free.name}
                            description={planCardContent.free.description}
                            price={`$${freePrice}`}
                            period={freePrice === 0 ? undefined : "/month"}
                            priceLabel={freePrice === 0 ? "Free forever" : undefined}
                            features={planCardContent.free.features}
                            cta={{ label: planCardContent.free.cta, href: planCardContent.free.ctaHref }}
                        />
                        <PricingCard
                            name={planCardContent.pro.name}
                            description={planCardContent.pro.description}
                            price={`$${proPrice}`}
                            period="/month"
                            priceLabel={interval === "annual" ? `Billed $${proPrice * 12}/year` : "Billed monthly"}
                            features={planCardContent.pro.features}
                            cta={{ label: planCardContent.pro.cta, href: planCardContent.pro.ctaHref }}
                            highlighted
                        />
                    </div>
                </div>
            </section>

            {/* Feature Comparison Section */}
            <section className="py-16 sm:py-20 bg-muted/30">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Compare Plans
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            See exactly what you get with each plan
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                        <FeatureComparisonTable />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            {pricingFAQContent.heading}
                        </h2>
                    </div>

                    <PricingFAQ />
                </div>
            </section>

            {/* Trust Signals */}
            <section className="py-10 bg-muted/30">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <TrustBadges />
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 sm:py-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        {pricingCTAContent.headline}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        {pricingCTAContent.subheadline}
                    </p>
                    <Link href={pricingCTAContent.ctaHref}>
                        <Button size="lg" className="text-base px-8">
                            {pricingCTAContent.cta}
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
