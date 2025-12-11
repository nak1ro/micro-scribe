"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, hasError = false, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "transition-colors duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
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
Input.displayName = "Input";

export { Input };
export type { InputProps };
