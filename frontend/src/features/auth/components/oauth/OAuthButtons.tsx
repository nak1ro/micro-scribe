"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useOAuth, type OAuthProviderId } from "../../hooks/useOAuth";
import { GoogleIcon } from "./GoogleIcon";
import { MicrosoftIcon } from "./MicrosoftIcon";

// OAuth Button styles
const oauthButtonStyles = cn(
    "w-full h-13 gap-3 text-base",
    "hover:bg-accent/50 hover:border-primary/30",
    "transition-all duration-[var(--transition-fast)]"
);

// OAuth Provider Config
const oauthProviders = [
    {
        id: "google",
        name: "Google",
        icon: GoogleIcon,
    },
    {
        id: "microsoft",
        name: "Microsoft",
        icon: MicrosoftIcon,
    },
] as const;

// Component

interface OAuthButtonsProps {
    mode: "login" | "signup";
    onProviderClick?: (providerId: OAuthProviderId) => void;
}

export function OAuthButtons({ mode, onProviderClick }: OAuthButtonsProps) {
    const actionText = mode === "login" ? "Continue" : "Sign up";
    const { handleOAuthLogin } = useOAuth();

    const handleClick = (providerId: OAuthProviderId) => {
        // Allow parent to override or interception
        if (onProviderClick) {
            onProviderClick(providerId);
        } else {
            handleOAuthLogin(providerId);
        }
    };

    return (
        <div className="space-y-3">
            {oauthProviders.map((provider) => {
                const Icon = provider.icon;
                return (
                    <Button
                        key={provider.id}
                        type="button"
                        variant="outline"
                        className={oauthButtonStyles}
                        aria-label={`${actionText} with ${provider.name}`}
                        onClick={() => handleClick(provider.id)}
                    >
                        <Icon className="h-6 w-6" />
                        <span>
                            {actionText} with {provider.name}
                        </span>
                    </Button>
                );
            })}
        </div>
    );
}
