"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: SpinnerSize;
}

const sizeClasses: Record<SpinnerSize, string> = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
    ({ className, size = "md", ...props }, ref) => {
        return (
            <div
                ref={ref}
                role="status"
                aria-label="Loading"
                className={cn(
                    "inline-block animate-spin rounded-full border-current border-t-transparent",
                    sizeClasses[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Spinner.displayName = "Spinner";

export { Spinner };
export type { SpinnerProps, SpinnerSize };
