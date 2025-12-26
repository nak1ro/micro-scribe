"use client";

import * as React from "react";
import { StarSolid, NavArrowLeft, NavArrowRight } from "iconoir-react";
import { cn } from "@/lib/utils";
import { testimonialsContent } from "../data/content";

// Hook for intersection observer
function useInView(threshold = 0.2) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = React.useState(false);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isInView };
}

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);
    const { ref, isInView } = useInView(0.15);
    const testimonials = testimonialsContent.testimonials;

    // Show 3 at a time on desktop, 1 on mobile
    const itemsPerPage = 3;
    const totalPages = Math.ceil(testimonials.length / itemsPerPage);

    // Auto-rotate carousel
    React.useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalPages);
        }, 5000);

        return () => clearInterval(timer);
    }, [isAutoPlaying, totalPages]);

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    const goToPrev = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const goToPage = (page: number) => {
        setIsAutoPlaying(false);
        setCurrentIndex(page);
    };

    return (
        <section className="relative py-24 overflow-hidden" ref={ref}>
            {/* Subtle glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div
                    className={cn(
                        "text-center mb-12",
                        "transition-all duration-700",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                >
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-primary/10 rounded-full uppercase tracking-wider">
                        Testimonials
                    </span>
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        {testimonialsContent.heading}
                    </h2>
                </div>

                {/* Carousel container */}
                <div
                    className={cn(
                        "relative",
                        "transition-all duration-700 delay-200",
                        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                >
                    {/* Navigation buttons */}
                    <button
                        onClick={goToPrev}
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10",
                            "w-10 h-10 rounded-full bg-card border border-border shadow-lg",
                            "flex items-center justify-center",
                            "hover-subtle",
                            "hidden md:flex"
                        )}
                        aria-label="Previous testimonials"
                    >
                        <NavArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <button
                        onClick={goToNext}
                        className={cn(
                            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10",
                            "w-10 h-10 rounded-full bg-card border border-border shadow-lg",
                            "flex items-center justify-center",
                            "hover-subtle",
                            "hidden md:flex"
                        )}
                        aria-label="Next testimonials"
                    >
                        <NavArrowRight className="w-5 h-5 text-muted-foreground" />
                    </button>

                    {/* Carousel track */}
                    <div className="overflow-hidden mx-4 md:mx-8">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {/* Group testimonials into pages */}
                            {Array.from({ length: totalPages }).map((_, pageIndex) => (
                                <div
                                    key={pageIndex}
                                    className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 px-1"
                                >
                                    {testimonials
                                        .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                                        .map((testimonial, index) => (
                                            <TestimonialCard
                                                key={index}
                                                testimonial={testimonial}
                                            />
                                        ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dots indicator */}
                <div
                    className={cn(
                        "flex justify-center gap-2 mt-8",
                        "transition-all duration-700 delay-300",
                        isInView ? "opacity-100" : "opacity-0"
                    )}
                >
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToPage(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                currentIndex === index
                                    ? "w-6 bg-primary"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Mobile swipe hint */}
                <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">
                    Swipe to see more
                </p>
            </div>
        </section>
    );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonialsContent.testimonials[0] }) {
    return (
        <div
            className={cn(
                "p-5 rounded-2xl h-full",
                "bg-card border border-border shadow-sm",
                "hover-lift"
            )}
        >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <StarSolid
                        key={i}
                        className="h-4 w-4 fill-warning text-warning"
                    />
                ))}
            </div>

            {/* Quote */}
            <blockquote className="text-foreground mb-4 text-sm leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-3 mt-auto">
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
    );
}
