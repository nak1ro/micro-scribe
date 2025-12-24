"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatTimestamp, getSpeakerColor, getSpeakerBgColor, getSpeakerDisplayName } from "@/lib/utils";
import { hasSpeakerChanged } from "@/features/transcription/utils";
import type { ViewerSegment, SpeakerInfo } from "@/features/transcription/types";

interface TranscriptSegmentProps {
    segment: ViewerSegment;
    index: number;
    isActive: boolean;
    showTimecode: boolean;
    showSpeaker: boolean;
    previousSpeaker: string | null;
    speakerInfo?: SpeakerInfo;
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
    speakerInfo,
    onClick,
    segmentRef,
}: TranscriptSegmentProps) {
    const speakerChanged = showSpeaker && hasSpeakerChanged(segment.speaker, previousSpeaker);
    const speakerColor = segment.speaker ? getSpeakerColor(segment.speaker, speakerInfo?.color) : "";
    const speakerBgColor = segment.speaker ? getSpeakerBgColor(segment.speaker, speakerInfo?.color) : "";
    const speakerName = segment.speaker ? getSpeakerDisplayName(segment.speaker, speakerInfo?.displayName) : "";

    return (
        <>
            {/* Speaker separator with badge */}
            {speakerChanged && segment.speaker && (
                <div className="flex items-center gap-3 pt-6 pb-3">
                    <div className="h-px flex-1 bg-border" />
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full",
                        speakerBgColor
                    )}>
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            speakerColor.replace("text-", "bg-")
                        )} />
                        <span className={cn("text-xs font-semibold", speakerColor)}>
                            {speakerName}
                        </span>
                    </div>
                    <div className="h-px flex-1 bg-border" />
                </div>
            )}

            {/* First speaker label (no line above) */}
            {showSpeaker && index === 0 && segment.speaker && (
                <div className="flex items-center gap-3 pb-3">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full",
                        speakerBgColor
                    )}>
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            speakerColor.replace("text-", "bg-")
                        )} />
                        <span className={cn("text-xs font-semibold", speakerColor)}>
                            {speakerName}
                        </span>
                    </div>
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

