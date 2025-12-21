"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TranscriptSegment } from "./TranscriptSegment";
import type { ViewerSegment } from "@/features/transcription/types";

interface TranscriptContentProps {
    segments: ViewerSegment[];
    activeSegmentIndex: number;
    showTimecodes: boolean;
    showSpeakers: boolean;
    onSegmentClick: (index: number) => void;
    className?: string;
}

export function TranscriptContent({
    segments,
    activeSegmentIndex,
    showTimecodes,
    showSpeakers,
    onSegmentClick,
    className,
}: TranscriptContentProps) {
    const segmentRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to keep active segment centered
    React.useEffect(() => {
        const activeRef = segmentRefs.current.get(activeSegmentIndex);
        if (activeRef && containerRef.current) {
            activeRef.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }, [activeSegmentIndex]);

    if (segments.length === 0) {
        return (
            <div className={cn("flex-1 flex items-center justify-center p-8", className)}>
                <p className="text-muted-foreground italic">No transcript available.</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6",
                "scroll-smooth",
                className
            )}
        >
            <div className="max-w-5xl mx-auto">
                <div className="text-foreground leading-relaxed text-base md:text-lg">
                    {segments.map((segment, index) => (
                        <TranscriptSegment
                            key={segment.id}
                            segment={segment}
                            index={index}
                            isActive={index === activeSegmentIndex}
                            showTimecode={showTimecodes}
                            showSpeaker={showSpeakers}
                            previousSpeaker={index > 0 ? segments[index - 1].speaker : null}
                            onClick={onSegmentClick}
                            segmentRef={(el) => {
                                if (el) {
                                    segmentRefs.current.set(index, el);
                                } else {
                                    segmentRefs.current.delete(index);
                                }
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
