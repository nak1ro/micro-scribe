"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TranscriptSegment } from "./TranscriptSegment";
import type { ViewerSegment, SpeakerInfo } from "@/features/transcription/types";
import { useTranscriptLayout } from "@/features/transcription/hooks/useTranscriptLayout";
import { useAutoScroll } from "@/features/transcription/hooks/useAutoScroll";

interface TranscriptContentProps {
    segments: ViewerSegment[];
    speakers: SpeakerInfo[];
    activeSegmentIndex: number;
    showTimecodes: boolean;
    showSpeakers: boolean;
    displayLanguage: string | null;
    onSegmentClick: (index: number) => void;
    // Edit mode props
    isEditMode?: boolean;
    onEditClick?: (segment: ViewerSegment) => void;
    className?: string;
}

export function TranscriptContent({
    segments,
    speakers,
    activeSegmentIndex,
    showTimecodes,
    showSpeakers,
    displayLanguage,
    onSegmentClick,
    isEditMode = false,
    onEditClick,
    className,
}: TranscriptContentProps) {
    const segmentRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
    const containerRef = React.useRef<HTMLDivElement>(null);

    const { speakerMap, paragraphs } = useTranscriptLayout({ segments, speakers });

    useAutoScroll({ activeSegmentIndex, segmentRefs });

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
                                const speakerInfo = segment.speaker ? speakerMap.get(segment.speaker) : undefined;
                                return (
                                    <TranscriptSegment
                                        key={segment.id}
                                        segment={segment}
                                        index={index}
                                        isActive={index === activeSegmentIndex}
                                        showTimecode={showTimecodes}
                                        showSpeaker={showSpeakers}
                                        displayLanguage={displayLanguage}
                                        previousSpeaker={index > 0 ? segments[index - 1].speaker : null}
                                        speakerInfo={speakerInfo}
                                        onClick={onSegmentClick}
                                        isEditMode={isEditMode}
                                        onEditClick={onEditClick}
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
