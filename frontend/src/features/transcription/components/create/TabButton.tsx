"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    disabled?: boolean;
    badge?: string;
}

export function TabButton({ active, onClick, icon: Icon, label, disabled, badge }: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3",
                "text-sm font-medium transition-colors",
                "border-b-2 -mb-[2px]",
                active
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent",
                !disabled && !active && "hover:text-foreground hover:bg-accent/50",
                disabled && "opacity-60 cursor-not-allowed"
            )}
        >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
            {badge && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary uppercase tracking-wide">
                    {badge}
                </span>
            )}
        </button>
    );
}
