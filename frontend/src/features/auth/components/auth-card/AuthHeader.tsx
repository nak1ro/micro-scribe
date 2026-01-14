"use client";

import { Microphone, Sparks } from "iconoir-react";
import { AuthMode } from "./AuthTabs";

interface AuthHeaderProps {
    mode: AuthMode;
}

export function AuthHeader({ mode }: AuthHeaderProps) {
    return (
        <header className="relative px-6 pt-8 pb-6 text-center">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="relative">
                {/* Logo with glow effect */}
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                        <Microphone className="relative h-9 w-9 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        ScribeRocket
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                    {mode === "login" ? (
                        "Welcome back"
                    ) : (
                        <>
                            Create your account
                            <Sparks className="h-5 w-5 text-primary animate-pulse" />
                        </>
                    )}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {mode === "login"
                        ? "Log in to continue to your dashboard"
                        : "Start transcribing audio with AI precision"}
                </p>
            </div>
        </header>
    );
}
