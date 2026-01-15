"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { EditPencil } from "iconoir-react";
import { formatTimestamp } from "@/lib/utils";
import { hasSpeakerChanged } from "@/features/transcription/utils";
import type { ViewerSegment, SpeakerInfo } from "@/features/transcription/types";
import { SpeakerLabel } from "./SpeakerLabel";

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
                <div className="pt-3">
                    <SpeakerLabel speakerId={segment.speaker} speakerInfo={speakerInfo} />
                </div>
            )}

            {/* First speaker label (if enabled and first item) */}
            {showSpeaker && index === 0 && segment.speaker && !speakerChanged && (
                <SpeakerLabel speakerId={segment.speaker} speakerInfo={speakerInfo} />
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
