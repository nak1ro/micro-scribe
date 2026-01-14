import * as React from "react";
import type { TranscriptionListItem } from "@/types/models/transcription";
import type { SortOption, SortDirection } from "../types";

export function useDashboardFiltering(items: TranscriptionListItem[]) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState<SortOption>("timeAdded");
    const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

    const filteredAndSortedItems = React.useMemo(() => {
        let result = items;

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((item) =>
                item.fileName.toLowerCase().includes(query)
            );
        }

        // Sort
        const sorted = [...result].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "name":
                    comparison = a.fileName.localeCompare(b.fileName);
                    break;
                case "duration":
                    comparison = (a.duration ?? 0) - (b.duration ?? 0);
                    break;
                case "timeAdded":
                default:
                    comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return sorted;
    }, [items, searchQuery, sortBy, sortDirection]);

    return {
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
        filteredAndSortedItems
    };
}
