"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, hasError = false, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "transition-colors duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "resize-y",
                    hasError && "animate-shake border-destructive focus-visible:ring-destructive",
                    className
                )}
                ref={ref}
                aria-invalid={hasError || undefined}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
