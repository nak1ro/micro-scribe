"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui";
import { useInView } from "@/hooks";
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
import { LandingBackground } from "@/features/marketing/landing";

// Main pricing page component with all sections
export function PricingPage() {
    const [interval, setInterval] = React.useState<BillingInterval>("monthly");
    const { ref: heroRef, isInView: heroInView } = useInView(0.1);
    const { ref: compareRef, isInView: compareInView } = useInView(0.1);
    const { ref: faqRef, isInView: faqInView } = useInView(0.1);
    const { ref: ctaRef, isInView: ctaInView } = useInView(0.2);

    const freePrice = pricingConfig[interval].free;
    const proPrice = pricingConfig[interval].pro;

    return (
        <LandingBackground>
            {/* Hero Section */}
            <section className="relative py-16 sm:py-24 overflow-hidden" ref={heroRef}>
                {/* Decorative elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                    {/* Floating orbs */}
                    <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl animate-pulse delay-1000" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div
                        className={cn(
                            "text-center mb-12",
                            "transition-all duration-700",
                            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}
                    >
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                            {pricingHeroContent.headline}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {pricingHeroContent.subheadline}
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div
                        className={cn(
                            "mb-12",
                            "transition-all duration-700 delay-100",
                            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}
                    >
                        <PricingToggle value={interval} onChange={setInterval} />
                    </div>

                    {/* Plan Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div
                            className={cn(
                                "transition-all duration-700 delay-200",
                                heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                        >
                            <PricingCard
                                name={planCardContent.free.name}
                                description={planCardContent.free.description}
                                price={`$${freePrice}`}
                                period={freePrice === 0 ? undefined : "/month"}
                                priceLabel={freePrice === 0 ? "Free forever" : undefined}
                                features={planCardContent.free.features}
                                cta={{ label: planCardContent.free.cta, href: planCardContent.free.ctaHref }}
                            />
                        </div>
                        <div
                            className={cn(
                                "transition-all duration-700 delay-300",
                                heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                        >
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
                </div>
            </section>

            {/* Feature Comparison Section */}
            <section className="py-16 sm:py-20" ref={compareRef}>
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div
                        className={cn(
                            "text-center mb-10",
                            "transition-all duration-700",
                            compareInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Compare Plans
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            See exactly what you get with each plan
                        </p>
                    </div>

                    <div
                        className={cn(
                            "bg-card rounded-2xl border border-border shadow-lg overflow-hidden",
                            "transition-all duration-700 delay-100",
                            compareInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                    >
                        <FeatureComparisonTable />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-20" ref={faqRef}>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div
                        className={cn(
                            "text-center mb-10",
                            "transition-all duration-700",
                            faqInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            {pricingFAQContent.heading}
                        </h2>
                    </div>

                    <div
                        className={cn(
                            "transition-all duration-700 delay-100",
                            faqInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                    >
                        <PricingFAQ />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section
                className="relative py-16 sm:py-24 overflow-hidden"
                ref={ctaRef}
            >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent" />
                <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2
                        className={cn(
                            "text-3xl sm:text-4xl font-bold text-foreground mb-4",
                            "transition-all duration-700",
                            ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}
                    >
                        {pricingCTAContent.headline}
                    </h2>
                    <p
                        className={cn(
                            "text-lg text-muted-foreground mb-8",
                            "transition-all duration-700 delay-100",
                            ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}
                    >
                        {pricingCTAContent.subheadline}
                    </p>
                    <div
                        className={cn(
                            "transition-all duration-700 delay-200",
                            ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                    >
                        <CTAButton size="lg" href={pricingCTAContent.ctaHref}>
                            {pricingCTAContent.cta}
                        </CTAButton>
                    </div>
                </div>
            </section>
        </LandingBackground>
    );
}
