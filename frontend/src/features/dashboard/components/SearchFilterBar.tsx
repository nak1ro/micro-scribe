"use client";

import * as React from "react";
import { Search, Check, ArrowUp, ArrowDown } from "iconoir-react";
import { cn } from "@/lib/utils";
import type { SortOption, SortDirection } from "../types";
import { useOnClickOutside } from "@/hooks";

interface SearchFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: SortOption;
    sortDirection: SortDirection;
    onSortChange: (value: SortOption) => void;
    onDirectionChange: (value: SortDirection) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "timeAdded", label: "Time Added" },
    { value: "name", label: "Name" },
    { value: "duration", label: "Duration" },
];

export function SearchFilterBar({
    searchQuery,
    onSearchChange,
    sortBy,
    sortDirection,
    onSortChange,
    onDirectionChange
}: SearchFilterBarProps) {
    const [sortOpen, setSortOpen] = React.useState(false);
    const sortRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useOnClickOutside(sortRef, () => setSortOpen(false));

    const handleSortOptionClick = (option: SortOption) => {
        if (sortBy === option) {
            // Toggle direction if same option clicked
            onDirectionChange(sortDirection === "asc" ? "desc" : "asc");
        } else {
            onSortChange(option);
            // Default to desc for time/duration, asc for name
            onDirectionChange(option === "name" ? "asc" : "desc");
        }
        setSortOpen(false);
    };

    const DirectionIcon = sortDirection === "asc" ? ArrowUp : ArrowDown;

    return (
        <div className="flex flex-row gap-2">
            <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    aria-label="Search transcriptions"
                    className={cn(
                        "w-full h-10 pl-10 pr-4 rounded-lg",
                        "bg-card border border-border shadow-sm",
                        "text-sm text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                        "transition-shadow"
                    )}
                />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
                <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className={cn(
                        "flex items-center gap-2 px-3 h-10 rounded-lg whitespace-nowrap",
                        "bg-card border border-border shadow-sm",
                        "text-muted-foreground hover:text-foreground",
                        "transition-colors"
                    )}
                >
                    <span className="text-sm font-medium">
                        {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    </span>
                    <DirectionIcon className="h-3 w-3 text-primary" />
                </button>

                {sortOpen && (
                    <div className={cn(
                        "absolute right-0 top-full mt-1 z-50",
                        "w-44 py-1 rounded-lg",
                        "bg-card border border-border shadow-lg"
                    )}>
                        {SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortOptionClick(option.value)}
                                className={cn(
                                    "flex items-center justify-between w-full px-3 py-2 text-sm",
                                    "hover:bg-accent transition-colors",
                                    sortBy === option.value ? "text-primary" : "text-foreground"
                                )}
                            >
                                <span>{option.label}</span>
                                <span className="flex items-center gap-1">
                                    {sortBy === option.value && (
                                        <>
                                            <DirectionIcon className="h-3 w-3" />
                                            <Check className="h-4 w-4" />
                                        </>
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
