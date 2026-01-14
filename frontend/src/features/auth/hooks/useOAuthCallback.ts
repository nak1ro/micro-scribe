"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./useAuth";
import { getOrigin } from "./useOAuth";

export function useOAuthCallback(provider: string) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loginWithOAuth } = useAuth();

    const code = searchParams?.get("code") ?? null;
    const error = searchParams?.get("error") ?? null;
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;

        const handleCallback = async () => {
            if (error) {
                console.error("OAuth error:", error);
                router.push("/auth?error=oauth_denied");
                return;
            }

            if (!code || !provider) {
                console.error("Missing code or provider");
                router.push("/auth?error=invalid_callback");
                return;
            }

            try {
                processedRef.current = true;
                const redirectUri = `${getOrigin()}/auth/callback/${provider}`;
                await loginWithOAuth(provider, code, redirectUri);
                router.push("/dashboard");
            } catch (err) {
                console.error("OAuth login failed:", err);
                router.push("/auth?error=oauth_failed");
            }
        };

        handleCallback();
    }, [code, provider, error, loginWithOAuth, router]);

    return { provider };
}
