import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimecodeToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export function TimecodeToggle({ enabled, onChange }: TimecodeToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                "border",
                enabled
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
            )}
        >
            <Clock className="h-4 w-4" />
            <span>Timecodes</span>
            <div
                className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    enabled ? "bg-primary" : "bg-muted-foreground/30"
                )}
            >
                <div
                    className={cn(
                        "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all",
                        enabled ? "left-4" : "left-0.5"
                    )}
                />
            </div>
        </button>
    );
}
