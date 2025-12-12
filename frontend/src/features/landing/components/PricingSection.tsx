import * as React from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { pricingContent } from "../data/content";

export function PricingSection() {
    return (
        <section id="pricing" className="relative py-16 sm:py-20 scroll-mt-16 overflow-hidden">
            {/* Slightly stronger glow to emphasize pricing */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/8 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        {pricingContent.heading}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {pricingContent.subheading}
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {pricingContent.tiers.map((tier, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative p-8 rounded-2xl",
                                "bg-card border-2",
                                "shadow-card",
                                tier.highlighted
                                    ? "border-primary shadow-lg scale-[1.02]"
                                    : "border-border"
                            )}
                        >
                            {/* Badge */}
                            {tier.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                        {tier.badge}
                                    </span>
                                </div>
                            )}

                            {/* Tier Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-foreground">
                                    {tier.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {tier.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="text-center mb-6">
                                <span className="text-5xl font-bold text-foreground">
                                    {tier.price}
                                </span>
                                <span className="text-muted-foreground">/{tier.period}</span>
                            </div>

                            {/* CTA */}
                            <Link href={tier.cta.href} className="block mb-8">
                                <Button
                                    variant={tier.cta.variant}
                                    size="lg"
                                    className="w-full text-base"
                                >
                                    {tier.cta.label}
                                </Button>
                            </Link>

                            {/* Features */}
                            <div className="space-y-3">
                                {tier.features.map((feature, featureIndex) => (
                                    <div
                                        key={featureIndex}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-foreground">{feature}</span>
                                    </div>
                                ))}
                                {tier.limitations.map((limitation, limitationIndex) => (
                                    <div
                                        key={limitationIndex}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground">{limitation}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Note */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    {pricingContent.note}
                </p>
            </div>
        </section>
    );
}
