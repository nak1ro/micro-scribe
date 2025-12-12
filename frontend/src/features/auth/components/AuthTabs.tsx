"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

interface AuthTabsProps {
    activeTab: AuthMode;
    onTabChange?: (tab: AuthMode) => void;
}

export function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTabClick = (tab: AuthMode) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", tab);
        router.push(`/auth?${params.toString()}`);
        onTabChange?.(tab);
    };

    return (
        <div className="relative flex border-b border-border">
            <TabButton
                isActive={activeTab === "login"}
                onClick={() => handleTabClick("login")}
            >
                Log in
            </TabButton>
            <TabButton
                isActive={activeTab === "signup"}
                onClick={() => handleTabClick("signup")}
            >
                Sign up
            </TabButton>

            {/* Animated underline indicator */}
            <div
                className={cn(
                    "absolute bottom-0 h-0.5 bg-primary",
                    "transition-all duration-[var(--transition-normal)] ease-[var(--easing-soft)]",
                    activeTab === "login" ? "left-0 w-1/2" : "left-1/2 w-1/2"
                )}
            />
        </div>
    );
}

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 py-3 text-sm font-medium",
                "transition-colors duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
            )}
            aria-selected={isActive}
            role="tab"
        >
            {children}
        </button>
    );
}

export type { AuthMode };
