"use client";

import * as React from "react";

/**
 * Hook for intersection observer - triggers animation when element enters viewport
 * On mobile devices (< 640px), animations are disabled for better performance
 * @param threshold - Visibility percentage to trigger (0-1)
 * @returns ref to attach to element and isInView boolean
 */
export function useInView(threshold = 0.2) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    // Detect mobile on mount
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();

        // Skip animations on mobile - show content immediately
        if (window.innerWidth < 640) {
            setIsInView(true);
        }
    }, []);

    React.useEffect(() => {
        // Skip intersection observer on mobile
        if (isMobile) return;

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
    }, [threshold, isMobile]);

    return { ref, isInView };
}
