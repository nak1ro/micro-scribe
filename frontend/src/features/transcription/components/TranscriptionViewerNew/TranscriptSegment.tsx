"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatTimestamp, getSpeakerColor } from "@/lib/utils";
import { hasSpeakerChanged } from "@/features/transcription/utils";
import type { ViewerSegment } from "@/features/transcription/types";

interface TranscriptSegmentProps {
    segment: ViewerSegment;
    index: number;
    isActive: boolean;
    showTimecode: boolean;
    showSpeaker: boolean;
    previousSpeaker: string | null;
    onClick: (index: number) => void;
    segmentRef?: (el: HTMLDivElement | null) => void;
}

export function TranscriptSegment({
    segment,
    index,
    isActive,
    showTimecode,
    showSpeaker,
    previousSpeaker,
    onClick,
    segmentRef,
}: TranscriptSegmentProps) {
    const speakerChanged = showSpeaker && hasSpeakerChanged(segment.speaker, previousSpeaker);
    const speakerColor = segment.speaker ? getSpeakerColor(segment.speaker) : "";

    return (
        <>
            {/* Speaker separator line */}
            {speakerChanged && segment.speaker && (
                <div className="flex items-center gap-3 pt-6 pb-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className={cn("text-xs font-medium uppercase tracking-wider", speakerColor)}>
                        {segment.speaker}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>
            )}

            {/* First speaker label (no line above) */}
            {showSpeaker && index === 0 && segment.speaker && (
                <div className="flex items-center gap-3 pb-2">
                    <span className={cn("text-xs font-medium uppercase tracking-wider", speakerColor)}>
                        {segment.speaker}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>
            )}

            {/* Segment content */}
            <div
                ref={segmentRef}
                onClick={() => onClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick(index);
                    }
                }}
                className={cn(
                    "group inline cursor-pointer transition-all duration-200",
                    "rounded-sm px-1 py-0.5 -mx-1",
                    "hover:bg-highlight-hover",
                    isActive && "bg-highlight"
                )}
            >
                {/* Timestamp */}
                {showTimecode && (
                    <span className="text-primary font-medium text-sm mr-1.5">
                        ({formatTimestamp(segment.startSeconds)})
                    </span>
                )}

                {/* Text content */}
                <span className="text-foreground">{segment.text}</span>

                {/* Space after segment */}
                <span> </span>
            </div>
        </>
    );
}
