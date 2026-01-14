import * as React from "react";
import type { TranscriptionListItem } from "@/types/models/transcription";

export function useDashboardStats(items: TranscriptionListItem[]) {
    return React.useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalCount = items.length;
        const thisWeek = items.filter((item) => new Date(item.uploadDate) >= weekAgo).length;
        const totalDuration = items.reduce((sum, item) => sum + (item.duration ?? 0), 0);
        const processing = items.filter((item) => item.status === "processing" || item.status === "pending").length;

        return { totalCount, thisWeek, totalDuration, processing };
    }, [items]);
}
