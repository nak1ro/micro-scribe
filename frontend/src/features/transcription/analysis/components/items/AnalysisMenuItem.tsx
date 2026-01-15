import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, RefreshDouble, Plus } from "iconoir-react";
import type { AnalysisTypeConfig } from "../../constants";

interface AnalysisMenuItemProps {
    item: AnalysisTypeConfig;
    isLoading: boolean;
    isCompleted: boolean;
    isFailed: boolean;
    isActive: boolean;
    disabled?: boolean;
    onClick: () => void;
}

export function AnalysisMenuItem({
    item,
    isLoading,
    isCompleted,
    isFailed,
    isActive,
    disabled,
    onClick,
}: AnalysisMenuItemProps) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2",
                "text-left transition-colors",
                isActive ? "bg-primary/10" : "hover:bg-muted",
                (isLoading || disabled) && "opacity-70 cursor-wait"
            )}
        >
            <span className={cn("text-sm", isFailed ? "text-destructive" : "text-foreground")}>
                {item.label}
            </span>
            <div className="flex items-center gap-1">
                {isLoading && <RefreshDouble className="h-4 w-4 text-info animate-spin" />}
                {isCompleted && <Check className="h-4 w-4 text-success" />}
                {isFailed && <span className="text-xs text-destructive font-medium">Failed</span>}
                {!isCompleted && !isLoading && !isFailed && <Plus className="h-4 w-4 text-muted-foreground" />}
            </div>
        </button>
    );
}
