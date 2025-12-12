import * as React from "react";
import Link from "next/link";
import { Sparkles, Shield, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { finalCTAContent } from "../data/content";

export function FinalCTASection() {
    return (
        <section
            className={cn(
                "relative py-20 sm:py-28",
                "bg-gradient-to-br from-primary via-primary to-secondary"
            )}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                {/* Heading */}
                <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                    {finalCTAContent.heading}
                </h2>

                {/* Subheading */}
                <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                    {finalCTAContent.subheading}
                </p>

                {/* CTA */}
                <div className="mt-8">
                    <Link href={finalCTAContent.cta.href}>
                        <Button
                            size="lg"
                            className={cn(
                                "text-base px-8 py-6",
                                "bg-white text-primary hover:bg-white/90",
                                "shadow-lg hover:shadow-xl",
                                "transition-all duration-[var(--transition-fast)]"
                            )}
                        >
                            <Sparkles className="h-5 w-5 mr-2" />
                            {finalCTAContent.cta.label}
                        </Button>
                    </Link>
                </div>

                {/* Note */}
                <p className="mt-4 text-sm text-white/60">{finalCTAContent.note}</p>

                {/* Trust badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>No Credit Card Required</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
