import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "destructive" | "success" | "warning";
}

export function Alert({ className, variant = "default", children, ...props }: AlertProps) {
    const variantStyles = {
        default: "bg-muted/50 text-foreground border-border",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        success: "bg-success/10 text-success-foreground border-success/20", // Note: success-foreground usually light text on dark bg, check tokens
        warning: "bg-warning/10 text-warning-foreground border-warning/20"
    };

    // Correction for success text color based on common token patterns if needed, 
    // relying on 'text-green-600' etc logic usually, but using tokens here.
    // Assuming text-destructive is readable.

    return (
        <div
            role="alert"
            className={cn(
                "p-3 rounded-lg border text-sm animate-fade-in",
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
