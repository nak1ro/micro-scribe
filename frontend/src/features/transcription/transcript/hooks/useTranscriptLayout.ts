"use client";

import * as React from "react";
import type { ViewerSegment, SpeakerInfo } from "@/features/transcription/types";

interface UseTranscriptLayoutProps {
    segments: ViewerSegment[];
    speakers: SpeakerInfo[];
}

export function useTranscriptLayout({ segments, speakers }: UseTranscriptLayoutProps) {
    // Build speaker lookup map
    const speakerMap = React.useMemo(() => {
        const map = new Map<string, SpeakerInfo>();
        speakers.forEach((s) => map.set(s.id, s));
        return map;
    }, [speakers]);

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

    return { speakerMap, paragraphs };
}
