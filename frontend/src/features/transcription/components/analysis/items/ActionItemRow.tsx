import * as React from "react";
import { cn } from "@/lib/utils";
import { Circle, CheckCircle, User } from "iconoir-react";
import { getPriorityConfig } from "../constants";
import type { ActionItemContent } from "@/features/transcription/types/analysis";

interface ActionItemRowProps {
    item: ActionItemContent;
    isComplete: boolean;
    onToggle: () => void;
}

export function ActionItemRow({ item, isComplete, onToggle }: ActionItemRowProps) {
    const priorityConfig = getPriorityConfig(item.priority || "");

    return (
        <div
            className={cn(
                "group relative p-4 rounded-xl border",
                "bg-card/30 backdrop-blur-sm",
                "transition-all duration-300 ease-out",
                isComplete
                    ? "border-success/30 bg-success/5 opacity-70"
                    : "border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            )}
        >
            <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className={cn(
                        "mt-0.5 shrink-0 transition-transform duration-200",
                        "hover:scale-110 active:scale-95"
                    )}
                    aria-label={isComplete ? "Mark incomplete" : "Mark complete"}
                >
                    {isComplete ? (
                        <CheckCircle className="h-6 w-6 text-success" />
                    ) : (
                        <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    <p className={cn(
                        "text-sm text-foreground leading-relaxed transition-all duration-200",
                        isComplete && "line-through text-muted-foreground"
                    )}>
                        {item.task}
                    </p>

                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-2">
                        {item.owner && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                <User className="w-3 h-3" />
                                {item.owner}
                            </span>
                        )}
                        {item.priority && (
                            <span className={cn(
                                "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border",
                                priorityConfig.bg,
                                priorityConfig.text,
                                priorityConfig.border
                            )}>
                                <span className="text-[10px]">{priorityConfig.icon}</span>
                                {priorityConfig.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Priority accent bar */}
            {item.priority && !isComplete && (
                <div className={cn(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-full",
                    item.priority === "High" && "bg-red-500",
                    item.priority === "Medium" && "bg-amber-500",
                    item.priority === "Low" && "bg-emerald-500"
                )} />
            )}
        </div>
    );
}
