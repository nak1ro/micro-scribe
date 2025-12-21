import * as React from "react";

interface UseScrollDirectionOptions {
    threshold?: number;
    containerRef?: React.RefObject<HTMLElement | null>;
}

// Returns true when header should be visible, false when it should hide
export function useScrollDirection({
    threshold = 40,
    containerRef,
}: UseScrollDirectionOptions = {}): boolean {
    const [isVisible, setIsVisible] = React.useState(true);
    const lastScrollY = React.useRef(0);
    const accumulatedScroll = React.useRef(0);

    React.useEffect(() => {
        const container = containerRef?.current || window;
        const getScrollY = () =>
            containerRef?.current
                ? containerRef.current.scrollTop
                : window.scrollY;

        const handleScroll = () => {
            const currentScrollY = getScrollY();
            const delta = currentScrollY - lastScrollY.current;

            // At top of page - always show header
            if (currentScrollY <= 0) {
                setIsVisible(true);
                accumulatedScroll.current = 0;
                lastScrollY.current = currentScrollY;
                return;
            }

            // Accumulate scroll in the current direction
            if (delta > 0) {
                // Scrolling down
                accumulatedScroll.current = Math.max(0, accumulatedScroll.current) + delta;
            } else if (delta < 0) {
                // Scrolling up
                accumulatedScroll.current = Math.min(0, accumulatedScroll.current) + delta;
            }

            // Check threshold
            if (accumulatedScroll.current >= threshold) {
                setIsVisible(false);
                accumulatedScroll.current = 0;
            } else if (accumulatedScroll.current <= -threshold) {
                setIsVisible(true);
                accumulatedScroll.current = 0;
            }

            lastScrollY.current = currentScrollY;
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [threshold, containerRef]);

    return isVisible;
}
