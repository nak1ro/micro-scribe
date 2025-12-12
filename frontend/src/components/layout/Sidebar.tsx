"use client";

import * as React from "react";
import Link from "next/link";
import {
    Mic2,
    FolderOpen,
    User,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    X,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui";

interface SidebarProps {
    /** User's subscription status */
    isPremium?: boolean;
    /** Transcriptions used today (for free users) */
    transcriptionsUsed?: number;
    /** Max transcriptions per day (for free users) */
    transcriptionsLimit?: number;
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export function Sidebar({
    isPremium = false,
    transcriptionsUsed = 0,
    transcriptionsLimit = 10,
}: SidebarProps) {
    const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } =
        useSidebar();

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="p-4 border-b border-border">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity",
                        isCollapsed && "justify-center"
                    )}
                >
                    <Mic2 className="h-7 w-7 text-primary shrink-0" />
                    {!isCollapsed && (
                        <span className="text-lg font-semibold">MicroScribe</span>
                    )}
                </Link>
            </div>

            {/* Usage / Premium Status */}
            <div className="p-4 border-b border-border">
                {isPremium ? (
                    <PremiumBadge isCollapsed={isCollapsed} />
                ) : (
                    <UsageIndicator
                        used={transcriptionsUsed}
                        limit={transcriptionsLimit}
                        isCollapsed={isCollapsed}
                    />
                )}
            </div>

            {/* Get Premium CTA (free users only) */}
            {!isPremium && (
                <div className="p-4 border-b border-border">
                    <Link href="/dashboard/subscription">
                        <Button
                            variant="default"
                            size={isCollapsed ? "icon" : "sm"}
                            className={cn("w-full", isCollapsed && "h-10 w-10")}
                        >
                            <Sparkles className="h-4 w-4" />
                            {!isCollapsed && <span>Get Premium</span>}
                        </Button>
                    </Link>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 p-2">
                <NavItem
                    href="/dashboard/folders"
                    icon={FolderOpen}
                    label="Folders"
                    isCollapsed={isCollapsed}
                />
            </nav>

            {/* Bottom Navigation */}
            <div className="p-2 border-t border-border">
                <NavItem
                    href="/dashboard/account"
                    icon={User}
                    label="Account"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    href="/dashboard/subscription"
                    icon={CreditCard}
                    label="Subscription"
                    isCollapsed={isCollapsed}
                />
            </div>

            {/* Collapse Toggle (desktop only) */}
            <div className="hidden lg:block p-2 border-t border-border">
                <button
                    type="button"
                    onClick={toggleCollapse}
                    className={cn(
                        "flex items-center justify-center w-full p-2 rounded-md",
                        "text-muted-foreground hover:text-foreground hover:bg-accent",
                        "transition-colors duration-[var(--transition-fast)]"
                    )}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 h-screen",
                    "bg-card border-r border-border",
                    "shadow-[1px_0_3px_rgba(0,0,0,0.04)]",
                    "transition-[width] duration-[var(--transition-normal)] ease-[var(--easing-soft)]"
                )}
                style={{
                    width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                }}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Trigger */}
            <MobileTrigger />

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/50"
                    onClick={closeMobile}
                >
                    <aside
                        className={cn(
                            "fixed left-0 top-0 h-full w-[280px] bg-card",
                            "flex flex-col",
                            "animate-slide-in-up"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Close Button */}
                        <div className="absolute top-4 right-4">
                            <button
                                type="button"
                                onClick={closeMobile}
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Close sidebar"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            {/* Spacer for main content */}
            <div
                className="hidden lg:block shrink-0 transition-[width] duration-[var(--transition-normal)]"
                style={{
                    width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                }}
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────
// Mobile Trigger Button
// ─────────────────────────────────────────────────────────────

function MobileTrigger() {
    const { openMobile } = useSidebar();

    return (
        <button
            type="button"
            onClick={openMobile}
            className={cn(
                "lg:hidden fixed top-4 left-4 z-40",
                "p-2 rounded-md",
                "bg-card border border-border shadow-sm",
                "text-muted-foreground hover:text-foreground",
                "transition-colors"
            )}
            aria-label="Open sidebar"
        >
            <Menu className="h-5 w-5" />
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// Usage Indicator (Free Users)
// ─────────────────────────────────────────────────────────────

interface UsageIndicatorProps {
    used: number;
    limit: number;
    isCollapsed: boolean;
}

function UsageIndicator({ used, limit, isCollapsed }: UsageIndicatorProps) {
    const percentage = Math.min((used / limit) * 100, 100);

    if (isCollapsed) {
        return (
            <div
                className="flex items-center justify-center"
                title={`${used}/${limit} transcriptions used`}
            >
                <span className="text-xs font-medium text-muted-foreground">
                    {used}/{limit}
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily usage</span>
                <span className="font-medium">
                    {used}/{limit}
                </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-[var(--transition-normal)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Premium Badge
// ─────────────────────────────────────────────────────────────

function PremiumBadge({ isCollapsed }: { isCollapsed: boolean }) {
    if (isCollapsed) {
        return (
            <div
                className="flex items-center justify-center"
                title="Unlimited transcriptions"
            >
                <Sparkles className="h-5 w-5 text-primary" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                "bg-primary/10 text-primary"
            )}
        >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Unlimited</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Navigation Item
// ─────────────────────────────────────────────────────────────

interface NavItemProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isCollapsed: boolean;
}

function NavItem({ href, icon: Icon, label, isCollapsed }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-accent",
                "transition-colors duration-[var(--transition-fast)]",
                isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? label : undefined}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
        </Link>
    );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
