"use client";

import { useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RefreshDouble, WarningCircle } from "iconoir-react";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { loginWithOAuth } = useAuth();

    const provider = params?.provider as string;
    const code = searchParams?.get("code");
    const error = searchParams?.get("error");

    // Prevent double invocation in strict mode
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
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const redirectUri = `${origin}/auth/callback/${provider}`;
                await loginWithOAuth(provider, code, redirectUri);
                router.push("/dashboard");
            } catch (err) {
                console.error("OAuth login failed:", err);
                // Reset processed flag in case we want to retry (though usually redirecting away)
                // processedRef.current = false; 
                router.push("/auth?error=oauth_failed");
            }
        };

        handleCallback();
    }, [code, provider, error, loginWithOAuth, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshDouble className="h-6 w-6 text-primary animate-spin" />
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
