"use client";

import * as React from "react";

/**
 * Hook for intersection observer - triggers animation when element enters viewport
 * @param threshold - Visibility percentage to trigger (0-1)
 * @returns ref to attach to element and isInView boolean
 */
export function useInView(threshold = 0.2) {
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
