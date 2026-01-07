"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
    isLoading?: boolean;
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    variant = "default",
    isLoading = false,
}: ConfirmationDialogProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Prevent body scroll when modal is open
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!mounted || !open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => !isLoading && onOpenChange(false)}
            />

            {/* Dialog Content */}
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg",
                    "animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-4",
                    "sm:rounded-2xl"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-desc"
            >
                {/* Close Button */}
                <button
                    onClick={() => !isLoading && onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    disabled={isLoading}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <h2
                        id="dialog-title"
                        className="text-lg font-semibold leading-none tracking-tight"
                    >
                        {title}
                    </h2>
                    <div id="dialog-desc" className="text-sm text-muted-foreground">
                        {description}
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={() => {
                            onConfirm();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : confirmText}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
