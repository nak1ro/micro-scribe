"use client";

import { useOAuthCallback } from "../../hooks/useOAuthCallback";
import { Spinner } from "@/components/ui";

interface OAuthCallbackProps {
    provider: string;
}

export function OAuthCallback({ provider }: OAuthCallbackProps) {
    useOAuthCallback(provider);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Spinner size="md" className="text-primary" />
                </div>
                <div className="text-center space-y-1">
                    <h2 className="font-semibold text-lg">Authenticating...</h2>
                    <p className="text-sm text-muted-foreground">
                        Please wait while we log you in with {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "provider"}.
                    </p>
                </div>
            </div>
        </div>
    );
}
