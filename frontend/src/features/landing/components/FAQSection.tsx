"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { faqContent } from "../data/content";

export function FAQSection() {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <section id="faq" className="py-16 sm:py-20 bg-muted scroll-mt-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        {faqContent.heading}
                    </h2>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqContent.questions.map((faq, index) => (
                        <div
                            key={index}
                            className={cn(
                                "rounded-xl border border-border bg-card overflow-hidden",
                                "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                            )}
                        >
                            <button
                                type="button"
                                className={cn(
                                    "w-full flex items-center justify-between p-4 text-left",
                                    "transition-colors duration-[var(--transition-fast)]",
                                    "hover:bg-accent/50"
                                )}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                aria-expanded={openIndex === index}
                            >
                                <span className="font-medium text-foreground">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "h-5 w-5 text-muted-foreground shrink-0 ml-4",
                                        "transition-transform duration-[var(--transition-fast)]",
                                        openIndex === index && "rotate-180"
                                    )}
                                />
                            </button>

                            <div
                                className={cn(
                                    "overflow-hidden transition-all duration-[var(--transition-normal)] ease-[var(--easing-soft)]",
                                    openIndex === index
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0"
                                )}
                            >
                                <p className="px-4 pb-4 text-muted-foreground">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
