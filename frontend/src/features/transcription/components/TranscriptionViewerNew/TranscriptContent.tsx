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

    // Group segments into paragraphs
    const paragraphs = React.useMemo(() => {
        const result: (ViewerSegment & { originalIndex: number })[][] = [];
        let currentParagraph: (ViewerSegment & { originalIndex: number })[] = [];
        let sentencesInParagraph = 0;

        segments.forEach((segment, index) => {
            currentParagraph.push({ ...segment, originalIndex: index });

            // Check if segment ends with sentence-ending punctuation
            const text = segment.text.trim();
            const isSentenceEnd = /[.!?]$/.test(text);

            if (isSentenceEnd) {
                sentencesInParagraph++;
            }

            // End paragraph if enough sentences or forced break (e.g. very long paragraph)
            // Rule: At least 4 sentences, or 8 segments (failsafe for long run-on sentences)
            if ((sentencesInParagraph >= 4 && isSentenceEnd) || currentParagraph.length >= 8) {
                result.push(currentParagraph);
                currentParagraph = [];
                sentencesInParagraph = 0;
            }
        });

        // Push remaining
        if (currentParagraph.length > 0) {
            result.push(currentParagraph);
        }

        return result;
    }, [segments]);

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
                "flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 pb-28",
                "scroll-smooth",
                className
            )}
        >
            <div className="max-w-5xl mx-auto">
                <div className="max-w-5xl mx-auto space-y-6">
                    {paragraphs.map((paragraph, pIndex) => (
                        <div key={pIndex} className="text-foreground leading-relaxed text-base md:text-lg">
                            {paragraph.map((segment) => {
                                const index = segment.originalIndex;
                                return (
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
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
