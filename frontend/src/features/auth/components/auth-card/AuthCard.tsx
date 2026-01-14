"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { BackgroundGlow, Alert, Divider } from "@/components/ui";
import { useAuthFlow } from "../../hooks/useAuthFlow";
import { AuthHeader } from "./AuthHeader";
import { AuthFooter } from "./AuthFooter";
import { AuthTabs, type AuthMode } from "./AuthTabs";
import { LoginForm } from "../../forms/LoginForm";
import { RegisterForm as SignUpForm } from "../../forms/RegisterForm";
import { OAuthButtons } from "../oauth";

export function AuthCard() {
    const searchParams = useSearchParams();
    const modeParam = searchParams.get("mode");
    const activeTab: AuthMode = modeParam === "signup" ? "signup" : "login";

    const { error, handleLogin, handleSignUp } = useAuthFlow();

    return (
        <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <BackgroundGlow />

            {/* Main card */}
            <div
                aria-label="Authentication form"
                className="relative w-full bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-xl shadow-primary/5 dark:shadow-primary/10 animate-fade-in overflow-hidden"
            >
                <AuthHeader mode={activeTab} />

                {error && (
                    <div className="mx-6 mb-4">
                        <Alert variant="destructive">{error}</Alert>
                    </div>
                )}

                <div className="px-6 pb-4">
                    <OAuthButtons mode={activeTab} />
                    <Divider label="Or continue with email" />
                </div>

                <div className="px-6">
                    <AuthTabs activeTab={activeTab} />
                </div>

                <div className="p-6">
                    {activeTab === "login" ? (
                        <LoginForm onSubmit={handleLogin} />
                    ) : (
                        <SignUpForm onSubmit={handleSignUp} />
                    )}
                </div>

                <AuthFooter mode={activeTab} />
            </div>
        </div>
    );
}
