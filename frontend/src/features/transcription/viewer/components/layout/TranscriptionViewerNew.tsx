"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranscriptionViewer } from "../../hooks/useTranscriptionViewer";
import { ViewerHeader } from "./ViewerHeader";
import { ViewerLayout } from "./ViewerLayout";
import { ViewerSkeleton } from "../content/ViewerSkeleton";
import { ViewerStatus } from "../content/ViewerStatus";
import { ViewerError } from "../content/ViewerError";
import { ViewerContent } from "../content/ViewerContent";
import { ExportNotification } from "../content/ExportNotification";
import { AudioPlayer } from "@/features/transcription/player/components/AudioPlayer";
import { ActionsSidebar } from "../sidebar/ActionsSidebar";
import { SegmentEditModal } from "../modals/SegmentEditModal";
import type { TranscriptionData } from "@/features/transcription/types";

interface TranscriptionViewerNewProps {
    jobId?: string;
    data?: TranscriptionData;
    className?: string;
}

export function TranscriptionViewerNew({ jobId, data: providedData, className }: TranscriptionViewerNewProps) {
    const viewer = useTranscriptionViewer({ jobId, providedData });

    // Loading state
    if (viewer.isLoading) return <ViewerSkeleton />;

    // Error state
    if (viewer.error) return <ViewerError error={viewer.error} onBack={viewer.handleBack} />;

    // No data
    if (!viewer.data) return null;

    // Processing state
    if (viewer.data.status === "pending" || viewer.data.status === "processing") {
        return <ViewerStatus data={viewer.data} onToggleSidebar={() => viewer.setIsSidebarOpen(true)} onBack={viewer.handleBack} />;
    }

    // Completed state
    return (
        <div className={cn("h-full", className)}>
            <ExportNotification isVisible={viewer.isExporting} />

            {viewer.data.audioUrl && (
                <audio ref={viewer.audioRef} src={viewer.data.audioUrl} className="hidden" aria-label="Transcription audio" crossOrigin="anonymous" />
            )}

            <ViewerLayout
                isSidebarOpen={viewer.isSidebarOpen}
                onCloseSidebar={() => viewer.setIsSidebarOpen(false)}
                sidebar={
                    <ActionsSidebar
                        onCopy={viewer.handleCopy}
                        isCopied={viewer.copied}
                        canCopy={viewer.data.segments.length > 0}
                        showTimecodes={viewer.showTimecodes}
                        onToggleTimecodes={viewer.setShowTimecodes}
                        showSpeakers={viewer.showSpeakers}
                        onToggleSpeakers={viewer.setShowSpeakers}
                        hasSpeakers={viewer.hasSpeakers}
                        onExport={viewer.handleExport}
                        onTranslate={viewer.handleTranslate}
                        translatedLanguages={viewer.data.translatedLanguages}
                        translationStatus={viewer.data.translationStatus}
                        translatingToLanguage={viewer.data.translatingToLanguage}
                        canTranslate={viewer.limits.translation}
                        sourceLanguage={viewer.data.sourceLanguage}
                        displayLanguage={viewer.displayLanguage}
                        onDisplayLanguageChange={viewer.setDisplayLanguage}
                        analyses={viewer.analyses}
                        isAnalysisGenerating={viewer.isAnalysisGenerating}
                        generatingAnalysisTypes={viewer.generatingAnalysisTypes}
                        onGenerateAnalysis={viewer.handleGenerateAnalysis}
                        onGenerateAllAnalysis={viewer.handleGenerateAllAnalysis}
                        onSelectAnalysisView={viewer.handleSelectAnalysisView}
                        currentAnalysisView={viewer.currentAnalysisView}
                        isEditMode={viewer.isEditMode}
                        onToggleEditMode={viewer.handleToggleEditMode}
                        hasEditedSegments={viewer.getEditedSegments().length > 0}
                        onRevertAll={viewer.handleRevertAll}
                        isReverting={viewer.isReverting}
                    />
                }
                audioPlayer={
                    <AudioPlayer
                        currentTime={viewer.currentTime}
                        duration={viewer.duration}
                        isPlaying={viewer.isPlaying}
                        onPlayPause={viewer.toggle}
                        onSeek={viewer.seekTo}
                        onSkipBack={viewer.handleSkipBack}
                        onSkipForward={viewer.handleSkipForward}
                        disabled={!viewer.data.audioUrl}
                    />
                }
            >
                <ViewerHeader data={viewer.data} onToggleSidebar={() => viewer.setIsSidebarOpen(true)} currentAnalysisView={viewer.currentAnalysisView} />

                <ViewerContent
                    currentView={viewer.currentAnalysisView}
                    displayLanguage={viewer.displayLanguage}
                    getAnalysisByType={viewer.getAnalysisByType}
                    data={viewer.data}
                    activeSegmentIndex={viewer.activeSegmentIndex}
                    showTimecodes={viewer.showTimecodes}
                    showSpeakers={viewer.showSpeakers}
                    onSegmentClick={viewer.seekToSegment}
                    isEditMode={viewer.isEditMode}
                    onEditClick={viewer.handleSegmentEditClick}
                />
            </ViewerLayout>

            <SegmentEditModal
                segment={viewer.editingSegment}
                onClose={() => viewer.setEditingSegment(null)}
                onSave={viewer.handleSaveEdit}
                onRevert={viewer.handleRevertEdit}
                isSaving={viewer.isUpdating}
                isReverting={viewer.isReverting}
            />
        </div>
    );
}
