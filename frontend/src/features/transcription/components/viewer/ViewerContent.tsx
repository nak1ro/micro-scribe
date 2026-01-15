"use client";

import { ActionItemsView, MeetingMinutesView, AnalysisContentView } from "@/features/transcription";
import { TranscriptContent } from "../transcript/TranscriptContent";
import type { TranscriptionData, ViewerSegment } from "@/features/transcription/types";
import type { AnalysisType, TranscriptionAnalysisDto } from "@/features/transcription/types/analysis";

interface ViewerContentProps {
    currentView: string;
    displayLanguage: string | null;
    getAnalysisByType: (type: AnalysisType) => TranscriptionAnalysisDto | undefined;
    data: TranscriptionData;
    activeSegmentIndex: number;
    showTimecodes: boolean;
    showSpeakers: boolean;
    onSegmentClick: (index: number) => void;
    isEditMode: boolean;
    onEditClick: (segment: ViewerSegment) => void;
}

const GENERIC_ANALYSIS_TYPES = ["ShortSummary", "LongSummary", "Topics", "Sentiment"];

export function ViewerContent({
    currentView,
    displayLanguage,
    getAnalysisByType,
    data,
    activeSegmentIndex,
    showTimecodes,
    showSpeakers,
    onSegmentClick,
    isEditMode,
    onEditClick,
}: ViewerContentProps) {
    if (currentView === "ActionItems") {
        return <ActionItemsView actionItemsAnalysis={getAnalysisByType("ActionItems")} displayLanguage={displayLanguage} />;
    }

    if (currentView === "MeetingMinutes") {
        return <MeetingMinutesView minutesAnalysis={getAnalysisByType("MeetingMinutes")} displayLanguage={displayLanguage} />;
    }

    if (GENERIC_ANALYSIS_TYPES.includes(currentView)) {
        return (
            <AnalysisContentView
                analysis={getAnalysisByType(currentView as AnalysisType)}
                analysisType={currentView}
                displayLanguage={displayLanguage}
            />
        );
    }

    return (
        <TranscriptContent
            segments={data.segments}
            speakers={data.speakers}
            activeSegmentIndex={activeSegmentIndex}
            showTimecodes={showTimecodes}
            showSpeakers={showSpeakers}
            displayLanguage={displayLanguage}
            onSegmentClick={onSegmentClick}
            isEditMode={isEditMode}
            onEditClick={onEditClick}
        />
    );
}
