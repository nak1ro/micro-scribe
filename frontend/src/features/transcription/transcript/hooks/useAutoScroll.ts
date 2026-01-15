"use client";

import * as React from "react";

interface UseAutoScrollProps {
    activeSegmentIndex: number;
    segmentRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

export function useAutoScroll({ activeSegmentIndex, segmentRefs }: UseAutoScrollProps) {
    // Auto-scroll to keep active segment visible
    React.useEffect(() => {
        const activeRef = segmentRefs.current.get(activeSegmentIndex);

        if (activeRef) {
            // Scroll to center the active segment
            activeRef.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [activeSegmentIndex, segmentRefs]);
}
