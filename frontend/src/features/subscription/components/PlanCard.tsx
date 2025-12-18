"use client";

import * as React from "react";
import {
    Infinity,
    Upload,
    Sparkles,
    Zap,
    Clock,
    CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { PlanTier, SubscriptionPlan } from "../types";
import { CurrentPlanBadge } from "./CurrentPlanBadge";
import { subscriptionCopy } from "../data";

// Icon mapping for feature icons
const iconMap: Record<string, React.ElementType> = {
    Infinity,
    Upload,
    Sparkles,
    Zap,
    Clock,
    CheckCircle,
};

interface PlanCardProps {
    tier: PlanTier;
    currentPlan: SubscriptionPlan;
    onUpgrade: () => void;
    onDowngrade: () => void;
}

// Displays a single subscription plan with features and action button
export function PlanCard({ tier, currentPlan, onUpgrade, onDowngrade }: PlanCardProps) {
    const isCurrentPlan = tier.plan === currentPlan;
    const isPro = tier.plan === SubscriptionPlan.Pro;
    const isUpgrade = !isPro && currentPlan === SubscriptionPlan.Free;
    const isDowngrade = !isUpgrade && !isCurrentPlan;

    const handleAction = () => {
        if (isCurrentPlan) return;
        if (isPro) {
            onUpgrade();
        } else {
            onDowngrade();
        }
    };

    const getButtonLabel = () => {
        if (isCurrentPlan) return subscriptionCopy.currentPlanButton;
        if (isPro) return subscriptionCopy.upgradeButton;
        return subscriptionCopy.downgradeButton;
    };

    return (
        <div
            className={cn(
                "relative rounded-2xl overflow-hidden bg-card",
                "border-2 transition-all duration-300",
                isCurrentPlan
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-muted-foreground/30",
                isPro && "md:scale-[1.02]"
            )}
        >
            {/* Header section */}
            <div
                className={cn(
                    "px-6 py-6 text-center",
                    isPro
                        ? "bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground"
                        : "bg-card border-b border-border"
                )}
            >
                {/* Current plan badge */}
                {isCurrentPlan && (
                    <div className="flex justify-center mb-3">
                        <CurrentPlanBadge
                            className={isPro ? "bg-white/20 border-white/30 text-white" : ""}
                        />
                    </div>
                )}

                {/* Plan name */}
                <h3
                    className={cn(
                        "text-sm font-medium mb-1",
                        isPro ? "text-white/80" : "text-muted-foreground"
                    )}
                >
                    {tier.name}
                </h3>

                {/* Price display */}
                <div className="flex items-baseline justify-center gap-1">
                    <span
                        className={cn(
                            "text-4xl sm:text-5xl font-bold",
                            isPro ? "text-white" : "text-foreground"
                        )}
                    >
                        {tier.price}
                    </span>
                    <span
                        className={cn(
                            "text-base",
                            isPro ? "text-white/70" : "text-muted-foreground"
                        )}
                    >
                        /{tier.period}
                    </span>
                </div>

                {/* Price label */}
                {tier.priceLabel && (
                    <p
                        className={cn(
                            "text-xs mt-1",
                            isPro ? "text-white/60" : "text-muted-foreground"
                        )}
                    >
                        {tier.priceLabel}
                    </p>
                )}
            </div>

            {/* Features section */}
            <div className="bg-card px-6 py-6">
                <div className="space-y-4 mb-6">
                    {tier.features.map((feature, index) => {
                        const Icon = iconMap[feature.icon] || CheckCircle;
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                                        isPro ? "bg-primary/10" : "bg-muted"
                                    )}
                                >
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground">
                                        {feature.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action button */}
                <Button
                    variant={isCurrentPlan ? "outline" : isPro ? "default" : "outline"}
                    size="lg"
                    className={cn(
                        "w-full text-sm font-semibold uppercase tracking-wide",
                        isCurrentPlan && "cursor-default opacity-60",
                        isPro && !isCurrentPlan && "bg-primary hover:bg-primary/90"
                    )}
                    disabled={isCurrentPlan}
                    onClick={handleAction}
                >
                    {getButtonLabel()}
                </Button>
            </div>
        </div>
    );
}
