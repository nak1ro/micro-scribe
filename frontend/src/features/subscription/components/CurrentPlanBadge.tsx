"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrentPlanBadgeProps {
    className?: string;
}

// Badge indicating the user's current active plan
export function CurrentPlanBadge({ className }: CurrentPlanBadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full",
                "bg-primary/20 text-primary text-xs font-semibold",
                "border border-primary/30",
                className
            )}
        >
            <Check className="h-3.5 w-3.5" />
            <span>Your Plan</span>
        </div>
    );
}
