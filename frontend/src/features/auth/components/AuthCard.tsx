"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthTabs, type AuthMode } from "./AuthTabs";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";

export function AuthCard() {
    const searchParams = useSearchParams();
    const modeParam = searchParams.get("mode");
    const activeTab: AuthMode = modeParam === "signup" ? "signup" : "login";

    return (
        <div
            className={cn(
                "w-full max-w-md mx-auto",
                "bg-card border border-border rounded-2xl",
                "shadow-lg shadow-black/5 dark:shadow-black/20",
                "animate-fade-in"
            )}
        >
            {/* Header with branding */}
            <div className="px-6 pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                    <Mic2 className="h-8 w-8 text-primary" />
                    <span className="text-xl font-semibold text-foreground">
                        MicroScribe
                    </span>
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {activeTab === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {activeTab === "login"
                        ? "Log in to continue to your dashboard"
                        : "Start transcribing audio with AI precision"}
                </p>
            </div>

            {/* Tabs */}
            <div className="px-6">
                <AuthTabs activeTab={activeTab} />
            </div>

            {/* Form */}
            <div className="p-6">
                {activeTab === "login" ? (
                    <LoginForm
                        onSubmit={async (data) => {
                            // TODO: Implement actual login API call
                            console.log("Login:", data);
                            await new Promise((r) => setTimeout(r, 1500));
                        }}
                    />
                ) : (
                    <SignUpForm
                        onSubmit={async (data) => {
                            // TODO: Implement actual signup API call
                            console.log("Sign up:", data);
                            await new Promise((r) => setTimeout(r, 1500));
                        }}
                    />
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
    );
}
