import * as React from "react";
import { cn } from "@/lib/utils";
import { Pin, Check, HelpCircle } from "iconoir-react";
import type { MeetingSectionConfig } from "../../constants";

interface MeetingMinutesSectionProps {
    config: MeetingSectionConfig;
    data: string[] | undefined;
}

export function MeetingMinutesSection({ config, data }: MeetingMinutesSectionProps) {
    if (!data || data.length === 0) return null;

    // Map icons based on config key or pass icon in config (if we refactor config to include component refs)
    // Since we kept config data-only, we map here
    const Icon = config.key === "keyTopics" ? Pin :
        config.key === "decisions" ? Check :
            HelpCircle;

    return (
        <div
            className={cn(
                "rounded-xl border border-border/50 overflow-hidden",
                "bg-card/30 backdrop-blur-sm",
                "hover:shadow-sm transition-shadow duration-200"
            )}
        >
            {/* Section header */}
            <div className={cn(
                "flex items-center gap-3 px-5 py-3",
                "border-l-4",
                config.borderColor,
                config.bgColor
            )}>
                <Icon className={cn("w-5 h-5", config.iconColor)} />
                <h3 className="text-sm font-semibold text-foreground">
                    {config.title}
                </h3>
                <span className="ml-auto text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-background/50">
                    {data.length}
                </span>
            </div>

            {/* Section items */}
            <div className="px-5 py-3 space-y-2.5">
                {data.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-start gap-3 group"
                    >
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                            "transition-transform duration-200 group-hover:scale-125",
                            config.bulletColor
                        )} />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
