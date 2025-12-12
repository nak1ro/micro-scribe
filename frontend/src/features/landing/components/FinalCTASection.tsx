import * as React from "react";
import Link from "next/link";
import { Sparkles, Shield, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { finalCTAContent } from "../data/content";

export function FinalCTASection() {
    return (
        <section className="relative min-h-screen flex items-center py-12 overflow-hidden">
            {/* Accent glow for CTA differentiation */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-accent/30 blur-3xl" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            {/* Top and bottom fades for smooth transition */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                {/* Heading */}
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {finalCTAContent.heading}
                </h2>

                {/* Subheading */}
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {finalCTAContent.subheading}
                </p>

                {/* CTA */}
                <div className="mt-8">
                    <Link href={finalCTAContent.cta.href}>
                        <Button size="lg" className="text-base px-8 py-6">
                            <Sparkles className="h-5 w-5 mr-2" />
                            {finalCTAContent.cta.label}
                        </Button>
                    </Link>
                </div>

                {/* Note */}
                <p className="mt-4 text-sm text-muted-foreground">{finalCTAContent.note}</p>

                {/* Trust badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
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
