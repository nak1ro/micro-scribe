"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mic2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthTabs, type AuthMode } from "./AuthTabs";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { OAuthButtons } from "./OAuthButtons";

export function AuthCard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get("mode");
    const activeTab: AuthMode = modeParam === "signup" ? "signup" : "login";

    const { login, register } = useAuth();
    const [error, setError] = React.useState<string | null>(null);

    const handleLogin = async (data: { email: string; password: string }) => {
        setError(null);
        try {
            await login({ email: data.email, password: data.password });
            router.push("/transcription");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Login failed. Please try again.";
            setError(message);
            throw err; // Re-throw to let form know submission failed
        }
    };

    const handleSignUp = async (data: { name: string; email: string; password: string }) => {
        setError(null);
        try {
            // Note: Backend RegisterRequest expects email, password, confirmPassword
            // The name field is collected for UX but not sent to this endpoint
            await register({
                email: data.email,
                password: data.password,
                confirmPassword: data.password, // Form already validated match
            });
            router.push("/transcription");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Registration failed. Please try again.";
            setError(message);
            throw err;
        }
    };

    return (
        <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            {/* Background decorative elements */}
            <div className="absolute -inset-4 pointer-events-none">
                {/* Top-left glow */}
                <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
                {/* Bottom-right glow */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-secondary/20 blur-3xl" />
            </div>

            {/* Main card */}
            <div
                className={cn(
                    "relative w-full",
                    "bg-card/95 backdrop-blur-sm border border-border rounded-2xl",
                    "shadow-xl shadow-primary/5 dark:shadow-primary/10",
                    "animate-fade-in",
                    "overflow-hidden"
                )}
            >

                {/* Header with branding */}
                <div className="relative px-6 pt-8 pb-6 text-center">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                    <div className="relative">
                        {/* Logo with glow effect */}
                        <div className="inline-flex items-center justify-center gap-2 mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                                <Mic2 className="relative h-9 w-9 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-foreground">
                                MicroScribe
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                            {activeTab === "login" ? (
                                "Welcome back"
                            ) : (
                                <>
                                    Create your account
                                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                                </>
                            )}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {activeTab === "login"
                                ? "Log in to continue to your dashboard"
                                : "Start transcribing audio with AI precision"}
                        </p>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mx-6 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                        {error}
                    </div>
                )}

                {/* OAuth Buttons */}
                <div className="px-6 pb-4">
                    <OAuthButtons mode={activeTab} />

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6">
                    <AuthTabs activeTab={activeTab} />
                </div>

                {/* Form */}
                <div className="p-6">
                    {activeTab === "login" ? (
                        <LoginForm onSubmit={handleLogin} />
                    ) : (
                        <SignUpForm onSubmit={handleSignUp} />
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-2 text-center border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        {activeTab === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <a
                                    href="/auth?mode=signup"
                                    className="text-primary font-medium hover:underline"
                                >
                                    Sign up
                                </a>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <a
                                    href="/auth?mode=login"
                                    className="text-primary font-medium hover:underline"
                                >
                                    Log in
                                </a>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
