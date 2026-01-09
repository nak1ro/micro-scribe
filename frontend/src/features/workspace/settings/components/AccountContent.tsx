"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Lock, FileText, CreditCard, Trash, Palette, LogOut } from "lucide-react";
import { Button, ThemeToggle } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

// Account settings page content
export function AccountContent() {
    const { user, logout } = useAuth();

    // Check if user signed in via OAuth (no password)
    const isOAuthUser = !user?.emailConfirmed; // Simplified check - adjust based on actual logic

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Account Settings
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Manage your account and preferences
                </p>
            </div>

            {/* Email Section */}
            <SettingsCard
                icon={Mail}
                title="Email Address"
                description="Your account email"
            >
                <div className="text-sm text-foreground font-medium">
                    {user?.email ?? "Loading..."}
                </div>
            </SettingsCard>

            {/* Password Section - hide for OAuth users */}
            {!isOAuthUser && (
                <SettingsCard
                    icon={Lock}
                    title="Password"
                    description="Secure your account"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">••••••••••••</span>
                        <Button variant="outline" size="sm" disabled>
                            Change Password
                        </Button>
                    </div>
                </SettingsCard>
            )}

            {/* Terms of Use Section */}
            <SettingsCard
                icon={FileText}
                title="Terms of Use"
                description="Read our terms and conditions"
            >
                <Button variant="outline" size="sm" disabled>
                    View Terms
                </Button>
            </SettingsCard>

            {/* Subscription Section */}
            <SettingsCard
                icon={CreditCard}
                title="Subscription"
                description="Manage your subscription and billing"
            >
                <Link href="/account/billing">
                    <Button variant="outline" size="sm">
                        Manage Subscription
                    </Button>
                </Link>
            </SettingsCard>

            {/* Appearance Section */}
            <SettingsCard
                icon={Palette}
                title="Appearance"
                description="Customize your interface theme"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-medium">Interface Theme</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">Toggle mode</span>
                        <ThemeToggle />
                    </div>
                </div>
            </SettingsCard>

            {/* Log Out Section */}
            <SettingsCard
                icon={LogOut}
                title="Log Out"
                description="Sign out of your account"
            >
                <Button variant="outline" size="sm" onClick={() => logout()}>
                    Log Out
                </Button>
            </SettingsCard>

            {/* Danger Zone - Delete Account */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-destructive/10">
                        <Trash className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            Delete Account
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="mt-4"
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable settings card component
interface SettingsCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children: React.ReactNode;
}

function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                    <div className="mt-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
