import * as React from "react";
import { cn } from "@/lib/utils";
import { WarningTriangle } from "iconoir-react";

interface AnalysisStateProps {
    className?: string;
    children?: React.ReactNode;
}

export function AnalysisLoading({ className, children }: AnalysisStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 space-y-4", className)}>
            <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg">✨</span>
                </div>
            </div>
            <p className="text-muted-foreground animate-pulse font-medium">
                {children || "AI is thinking..."}
            </p>
        </div>
    );
}

interface AnalysisErrorProps extends AnalysisStateProps {
    message?: string;
}

export function AnalysisError({ className, message }: AnalysisErrorProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
            <div className="p-4 bg-destructive/10 rounded-2xl mb-4">
                <WarningTriangle className="w-8 h-8 text-destructive" />
            </div>
            <p className="font-semibold text-foreground mb-1">Analysis Failed</p>
            <p className="text-sm text-muted-foreground max-w-xs">
                {message || "An unexpected error occurred."}
            </p>
        </div>
    );
}

interface AnalysisEmptyProps extends AnalysisStateProps {
    icon?: React.ReactNode;
}

export function AnalysisEmpty({ className, children, icon }: AnalysisEmptyProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <span className="text-2xl opacity-50">{icon || "📊"}</span>
            </div>
            <div className="text-muted-foreground">
                {children}
            </div>
        </div>
    );
}
