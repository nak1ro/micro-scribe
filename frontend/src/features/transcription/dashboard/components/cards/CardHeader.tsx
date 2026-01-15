"use client";

import { MusicDoubleNote } from "iconoir-react";
import { cn } from "@/lib/utils";

interface CardHeaderProps {
    fileName: string;
    isSelected: boolean;
    isHovered: boolean;
    onSelect: () => void;
}

export function CardHeader({ fileName, isSelected, isHovered, onSelect }: CardHeaderProps) {
    const showCheckbox = isSelected || isHovered;

    return (
        <div className="flex items-center gap-3 mb-3 pr-10">
            <div
                className="relative p-2 rounded-lg bg-primary/10 shrink-0 h-9 w-9 flex items-center justify-center cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
                <MusicDoubleNote className={cn("h-5 w-5 text-primary transition-opacity duration-200", showCheckbox ? "opacity-0" : "opacity-100")} />
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); onSelect(); }}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        "h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer",
                        "transition-opacity duration-200",
                        showCheckbox ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    aria-label={`Select ${fileName}`}
                />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground truncate text-lg" title={fileName}>{fileName}</h3>
            </div>
        </div>
    );
}
