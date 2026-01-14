import * as React from "react";
import { cn } from "@/lib/utils";

interface IconWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "destructive" | "success" | "neutral";
}

export function IconWrapper({ className, size = "md", variant = "primary", children, ...props }: IconWrapperProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    const variantClasses = {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        destructive: "bg-destructive/10 text-destructive",
        success: "bg-success/10 text-success", // Using simplified token mapping
        neutral: "bg-muted text-muted-foreground"
    };

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
