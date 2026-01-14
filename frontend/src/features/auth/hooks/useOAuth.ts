"use client";

import { useCallback } from "react";
import type { AuthError } from "../types";

export type OAuthProviderId = "google" | "microsoft";

// OAuth provider configuration
const OAUTH_CONFIG = {
    google: {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        clientIdEnvKey: "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
        scope: "openid email profile",
        extraParams: {
            access_type: "offline",
            prompt: "consent",
        },
    },
    microsoft: {
        authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        clientIdEnvKey: "NEXT_PUBLIC_MICROSOFT_CLIENT_ID",
        scope: "openid email profile User.Read offline_access",
        extraParams: {
            response_mode: "query",
        },
    },
} as const;

// Shared helper for getting origin
export function getOrigin(): string {
    return typeof window !== "undefined" ? window.location.origin : "";
}

export function useOAuth() {
    const handleOAuthLogin = useCallback((providerId: OAuthProviderId): AuthError | null => {
        const config = OAUTH_CONFIG[providerId];
        const clientId = process.env[config.clientIdEnvKey];

        if (!clientId) {
            const error: AuthError = {
                status: 500,
                message: `Missing ${providerId} client ID`,
                detail: `Environment variable ${config.clientIdEnvKey} is not set`,
            };
            console.error(error.message);
            return error;
        }

        const redirectUri = `${getOrigin()}/auth/callback/${providerId}`;
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: config.scope,
            ...config.extraParams,
        });

        window.location.href = `${config.authUrl}?${params.toString()}`;
        return null;
    }, []);

    return { handleOAuthLogin };
}
