import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { testimonialsContent } from "../data/content";

export function TestimonialsSection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        {testimonialsContent.heading}
                    </h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonialsContent.testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className={cn(
                                "p-6 rounded-xl",
                                "bg-card border border-border",
                                "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                            )}
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-foreground mb-4">
                                "{testimonial.quote}"
                            </blockquote>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                {/* Avatar placeholder */}
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
