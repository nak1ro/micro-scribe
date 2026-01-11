"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "iconoir-react";

interface FloatingActionButtonProps {
    onClick?: () => void;
    className?: string;
    label?: string;
}

export function FloatingActionButton({
    onClick,
    className,
    label = "New Transcription",
}: FloatingActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "fixed bottom-6 right-6 z-40",
                "flex items-center gap-2 px-5 py-4 rounded-full",
                "bg-gradient-to-r from-primary to-secondary",
                "text-primary-foreground font-medium",
                "shadow-xl shadow-primary/30",
                "hover:shadow-2xl hover:shadow-primary/40",
                "hover:scale-105",
                "active:scale-95",
                "transition-all duration-200",
                className
            )}
            title={label}
        >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
