"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateOptionCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    onClick?: () => void;
}

export function EmptyStateOptionCard({ icon: Icon, title, description, onClick }: EmptyStateOptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 flex flex-col items-center gap-2 p-5",
                "bg-muted/30 hover:bg-muted/50",
                "border border-border hover:border-primary/30",
                "rounded-xl",
                "transition-all duration-200",
                "hover:shadow-md",
                "group"
            )}
        >
            <div
                className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    "bg-primary/10 group-hover:bg-primary/20",
                    "transition-colors"
                )}
            >
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </button>
    );
}
