"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { CheckCircle, WarningCircle, ArrowRight, SpinnerGap } from "@phosphor-icons/react";
import { PublicLayout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/services/auth";

type ConfirmationState = "verifying" | "success" | "error";

function ConfirmEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const [state, setState] = useState<ConfirmationState>("verifying");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Resend form state
    const [email, setEmail] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    useEffect(() => {
        const confirmEmail = async () => {
            if (!userId || !token) {
                setState("error");
                setErrorMessage("Invalid confirmation link. Missing required parameters.");
                return;
            }

            try {
                await authApi.confirmEmail(userId, token);
                setState("success");

                // If user is logged in, redirect to dashboard after brief delay
                if (user) {
                    setTimeout(() => {
                        router.push("/dashboard");
                    }, 2000);
                }
            } catch (error: unknown) {
                setState("error");
                const err = error as { response?: { data?: { detail?: string } } };
                setErrorMessage(
                    err.response?.data?.detail || "Verification failed. The link may have expired."
                );
            }
        };

        confirmEmail();
    }, [userId, token, user, router]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setResendLoading(true);
        try {
            await authApi.resendConfirmation(email);
            setResendSuccess(true);
        } catch {
            // Silent fail for security - don't reveal if email exists
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                {/* Verifying State */}
                {state === "verifying" && (
                    <div className="flex flex-col items-center text-center space-y-4">
                        <SpinnerGap className="w-16 h-16 text-primary animate-spin" />
                        <h1 className="text-2xl font-semibold text-foreground">
                            Verifying your email...
                        </h1>
                        <p className="text-muted-foreground">
                            Please wait while we confirm your email address.
                        </p>
                    </div>
                )}

                {/* Success State */}
                {state === "success" && (
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" weight="fill" />
                        </div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Email verified!
                        </h1>
                        <p className="text-muted-foreground">
                            {user
                                ? "Redirecting to dashboard..."
                                : "Your email has been confirmed. You can now log in."}
                        </p>
                        {!user && (
                            <button
                                onClick={() => router.push("/auth")}
                                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Go to Login
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Error State */}
                {state === "error" && (
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <WarningCircle className="w-10 h-10 text-destructive" weight="fill" />
                        </div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Verification failed
                        </h1>
                        <p className="text-muted-foreground">{errorMessage}</p>

                        {/* Resend Form */}
                        {!resendSuccess ? (
                            <form onSubmit={handleResend} className="w-full mt-4 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Enter your email to receive a new verification link:
                                </p>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={resendLoading}
                                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {resendLoading ? "Sending..." : "Request new link"}
                                </button>
                            </form>
                        ) : (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    If an account exists with that email, a new verification link has been sent.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <PublicLayout>
            <div className="relative flex min-h-[calc(100vh-4rem-200px)] items-center justify-center px-4 py-12 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-dot-grid opacity-30" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
                </div>

                <Suspense
                    fallback={
                        <div className="w-full max-w-md h-[400px] bg-card border border-border rounded-2xl animate-pulse" />
                    }
                >
                    <ConfirmEmailContent />
                </Suspense>
            </div>
        </PublicLayout>
    );
}
