import * as React from "react";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/features/transcription/types/analysis";
import { ANALYSIS_TYPES_CONFIG, AnalysisTypeConfig } from "../constants";
import { useOnClickOutside } from "@/hooks"; // Assuming this hook exists based on original file

interface UseAnalysisMenuProps {
    analyses: TranscriptionAnalysisDto[];
    generatingTypes: AnalysisType[];
    onGenerate: (types: AnalysisType[]) => void;
    onSelectView: (view: AnalysisType) => void;
}

export function useAnalysisMenu({
    analyses,
    generatingTypes,
    onGenerate,
    onSelectView,
}: UseAnalysisMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    useOnClickOutside(menuRef, () => setIsOpen(false));

    // Check helpers
    const getAnalysis = (type: AnalysisType) => analyses.find(a => a.analysisType === type);

    // An item is "loading" if the API request is in flight OR if the background job is pending/processing
    const isLoading = (type: AnalysisType) => {
        const analysis = getAnalysis(type);
        return generatingTypes.includes(type) ||
            analysis?.status === "Pending" ||
            analysis?.status === "Processing";
    };

    // An item is "complete" only if it exists and is marked Completed
    const isCompleted = (type: AnalysisType) => getAnalysis(type)?.status === "Completed";

    // An item is "failed"
    const isFailed = (type: AnalysisType) => getAnalysis(type)?.status === "Failed";

    const generatedCount = ANALYSIS_TYPES_CONFIG.filter(t => isCompleted(t.type)).length;

    // Handle item click
    const handleClick = (item: AnalysisTypeConfig) => {
        const loading = isLoading(item.type);
        const complete = isCompleted(item.type);

        // If loading, do nothing
        if (loading) {
            return;
        }

        // If has a view (ActionItems, MeetingMinutes)
        if (item.hasView) {
            // If complete, open the view
            if (complete) {
                onSelectView(item.type);
                setIsOpen(false);
                return;
            }

            // If not complete (or failed), generate/retry
            onGenerate([item.type]);
        } else {
            // For other types, generate if not complete
            if (!complete) {
                onGenerate([item.type]);
            }
        }
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    return {
        isOpen,
        setIsOpen,
        menuRef,
        isLoading,
        isCompleted,
        isFailed,
        generatedCount,
        handleClick,
        toggleOpen
    };
}
