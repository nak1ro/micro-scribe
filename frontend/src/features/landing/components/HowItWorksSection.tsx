import * as React from "react";
import Link from "next/link";
import { Upload, Zap, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { howItWorksContent } from "../data/content";

const iconMap = {
    Upload,
    Zap,
    Edit,
};

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative min-h-screen flex items-center py-12 scroll-mt-16 overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-primary/5 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        {howItWorksContent.heading}
                    </h2>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection line (desktop) */}
                    <div className="hidden md:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
                        {howItWorksContent.steps.map((step, index) => {
                            const Icon = iconMap[step.icon as keyof typeof iconMap];
                            return (
                                <div key={index} className="relative text-center">
                                    {/* Step number */}
                                    <div className="relative z-10 mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-6">
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className="w-12 h-12 mx-auto rounded-lg bg-accent flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-accent-foreground" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        {step.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <Link href={howItWorksContent.cta.href}>
                        <Button size="lg" className="text-base px-8">
                            {howItWorksContent.cta.label}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
