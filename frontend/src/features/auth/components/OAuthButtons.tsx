"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

// ─────────────────────────────────────────────────────────────
// OAuth Button styles (shared across all OAuth buttons)
// ─────────────────────────────────────────────────────────────

const oauthButtonStyles = cn(
    "w-full h-13 gap-3 text-base",
    "hover:bg-accent/50 hover:border-primary/30",
    "transition-all duration-[var(--transition-fast)]"
);

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

function MicrosoftIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M1 1h10.5v10.5H1V1z" fill="#F25022" />
            <path d="M12.5 1H23v10.5H12.5V1z" fill="#7FBA00" />
            <path d="M1 12.5h10.5V23H1V12.5z" fill="#00A4EF" />
            <path d="M12.5 12.5H23V23H12.5V12.5z" fill="#FFB900" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────
// OAuth Provider Config
// ─────────────────────────────────────────────────────────────

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

type OAuthProviderId = (typeof oauthProviders)[number]["id"];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface OAuthButtonsProps {
    mode: "login" | "signup";
    onProviderClick?: (providerId: OAuthProviderId) => void;
}

export function OAuthButtons({ mode, onProviderClick }: OAuthButtonsProps) {
    const actionText = mode === "login" ? "Continue" : "Sign up";

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
                        onClick={() => {
                            // TODO: Implement OAuth flow
                            console.log(`${provider.name} OAuth clicked`);
                            onProviderClick?.(provider.id);
                        }}
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
