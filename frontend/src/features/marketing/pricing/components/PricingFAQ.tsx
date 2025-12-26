"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { pricingFAQContent } from "../data";

// FAQ accordion for pricing page
export function PricingFAQ() {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="space-y-4">
            {pricingFAQContent.questions.map((faq, index) => (
                <div
                    key={index}
                    className={cn(
                        "rounded-xl border border-border bg-card overflow-hidden",
                        "shadow-sm"
                    )}
                >
                    <button
                        type="button"
                        className={cn(
                            "w-full flex items-center justify-between p-5 text-left",
                            "transition-colors duration-[var(--transition-fast)]",
                            "hover:bg-accent/50"
                        )}
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        aria-expanded={openIndex === index}
                        aria-controls={`pricing-faq-${index}`}
                    >
                        <span className="text-base font-medium text-foreground pr-6">
                            {faq.question}
                        </span>
                        <ChevronDown
                            className={cn(
                                "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
                                openIndex === index && "rotate-180"
                            )}
                        />
                    </button>

                    <div
                        id={`pricing-faq-${index}`}
                        className={cn(
                            "px-5 text-muted-foreground overflow-hidden transition-all duration-300",
                            openIndex === index ? "max-h-48 pb-5" : "max-h-0"
                        )}
                    >
                        <p className="text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
