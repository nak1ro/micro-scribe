"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { EditPencil } from "iconoir-react";
import { formatTimestamp, getSpeakerColor, getSpeakerBgColor, getSpeakerDisplayName } from "@/lib/utils";
import { hasSpeakerChanged } from "@/features/transcription/utils";
import type { ViewerSegment, SpeakerInfo } from "@/features/transcription/types";

interface TranscriptSegmentProps {
    segment: ViewerSegment;
    index: number;
    isActive: boolean;
    showTimecode: boolean;
    showSpeaker: boolean;
    displayLanguage: string | null;
    previousSpeaker: string | null;
    speakerInfo?: SpeakerInfo;
    onClick: (index: number) => void;
    segmentRef?: (el: HTMLDivElement | null) => void;
    // Edit mode props
    isEditMode?: boolean;
    onEditClick?: (segment: ViewerSegment) => void;
}

export function TranscriptSegment({
    segment,
    index,
    isActive,
    showTimecode,
    showSpeaker,
    displayLanguage,
    previousSpeaker,
    speakerInfo,
    onClick,
    segmentRef,
    isEditMode = false,
    onEditClick,
}: TranscriptSegmentProps) {
    const speakerChanged = showSpeaker && hasSpeakerChanged(segment.speaker, previousSpeaker);
    const speakerColor = segment.speaker ? getSpeakerColor(segment.speaker, speakerInfo?.color) : "";
    const speakerBgColor = segment.speaker ? getSpeakerBgColor(segment.speaker, speakerInfo?.color) : "";
    const speakerName = segment.speaker ? getSpeakerDisplayName(segment.speaker, speakerInfo?.displayName) : "";

    // Resolve display text based on selected language
    const displayText = React.useMemo(() => {
        if (displayLanguage && segment.translations) {
            return segment.translations[displayLanguage] || segment.text;
        }
        return segment.text;
    }, [displayLanguage, segment.translations, segment.text]);

    // Handle click - either edit or seek
    const handleClick = () => {
        if (isEditMode && onEditClick) {
            onEditClick(segment);
        } else {
            onClick(index);
        }
    };

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
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                className={cn(
                    "group inline cursor-pointer transition-all duration-200",
                    "rounded-sm px-0.5 -mx-0.5",
                    // Normal mode styles
                    !isEditMode && "hover:bg-highlight-hover",
                    !isEditMode && isActive && "bg-highlight",
                    // Edit mode styles
                    isEditMode && "hover:bg-primary/10 hover:ring-1 hover:ring-primary/30",
                    isEditMode && "cursor-text",
                    // Edited indicator background - more visible
                    segment.isEdited && "bg-warning/10"
                )}
            >
                {/* Timestamp */}
                {showTimecode && (
                    <span className="text-primary font-medium text-sm mr-1.5">
                        ({formatTimestamp(segment.startSeconds)})
                    </span>
                )}

                {/* Text content */}
                <span className="text-foreground">{displayText}</span>

                {/* Edited indicator - after text so it stays on same line */}
                {segment.isEdited && (
                    <span className="inline-flex items-center ml-1 align-middle" title="Edited">
                        <EditPencil className="h-3 w-3 text-warning" />
                    </span>
                )}
            </div>
            {/* Space after segment (outside highlight) */}
            <span> </span>
        </>
    );
}
