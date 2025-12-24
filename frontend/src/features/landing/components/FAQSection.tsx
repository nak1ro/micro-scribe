"use client";

import * as React from "react";
import { NavArrowDown } from "iconoir-react";
import { cn } from "@/lib/utils";
import { faqContent } from "../data/content";

export function FAQSection() {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <section id="faq" className="relative py-16 sm:py-20 scroll-mt-16 overflow-hidden">
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
                                "shadow-card"
                            )}
                        >
                            <button
                                type="button"
                                className={cn(
                                    "w-full flex items-center justify-between p-6 text-left",
                                    "hover-subtle"
                                )}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-content-${index}`}
                            >
                                <span className="text-lg font-medium text-foreground pr-8">
                                    {faq.question}
                                </span>
                                <NavArrowDown
                                    className={cn(
                                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                                        openIndex === index && "rotate-180"
                                    )}
                                />
                            </button>

                            <div
                                id={`faq-content-${index}`}
                                className={cn(
                                    "px-6 text-muted-foreground overflow-hidden transition-all duration-300",
                                    openIndex === index ? "max-h-48 pb-6" : "max-h-0"
                                )}
                            >
                                <p className="text-muted-foreground">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
