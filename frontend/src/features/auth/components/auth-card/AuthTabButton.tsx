"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface AuthTabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

export function AuthTabButton({ isActive, onClick, children }: AuthTabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 py-3 text-sm font-medium",
                "transition-colors duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
            )}
            aria-selected={isActive}
            role="tab"
        >
            {children}
        </button>
    );
}
