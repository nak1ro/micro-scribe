import * as React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
    label?: string;
    className?: string;
}

export function Divider({ label, className }: DividerProps) {
    return (
        <div className={cn("relative my-6", className)}>
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
            </div>
            {label && (
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">
                        {label}
                    </span>
                </div>
            )}
        </div>
    );
}
