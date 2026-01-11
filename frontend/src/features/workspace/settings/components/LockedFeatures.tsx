"use client";

import * as React from "react";
import { Infinite, Flash, Language, Database, Lock } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { lockedFeatures } from "../data";

const iconMap: Record<string, React.ElementType> = {
    Infinity: Infinite,
    Zap: Flash,
    Languages: Language,
    Database,
};

interface LockedFeaturesProps {
    onUpgrade: () => void;
}

// Shows locked premium features with upgrade CTA (for Free users)
export function LockedFeatures({ onUpgrade }: LockedFeaturesProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">
                    Unlock Pro Features
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {lockedFeatures.map((feature, index) => {
                    const Icon = iconMap[feature.icon] || Flash;
                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-lg",
                                "bg-muted/50 border border-border/50"
                            )}
                        >
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {feature.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Button onClick={onUpgrade} className="w-full">
                Upgrade to Unlock
            </Button>
        </div>
    );
}
