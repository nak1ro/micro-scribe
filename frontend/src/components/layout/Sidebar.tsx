"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mic2,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    X,
    Menu,
    FileAudio,
    Plus,
    Settings,
    Folder,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui";
import { useUsage } from "@/hooks/useUsage";
import { useFolders, FOLDER_COLORS } from "@/hooks";
import { PlanType } from "@/types/api/usage";
import { FolderColor } from "@/types/models/folder";
import { FolderModal } from "@/features/folder";

interface SidebarProps {
    /** Callback when New Transcription is clicked */
    onNewTranscription?: () => void;
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export function Sidebar({ onNewTranscription }: SidebarProps) {
    const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } =
        useSidebar();
    const { data: usage } = useUsage();

    const isPremium = usage?.planType === PlanType.Pro;
    const transcriptionsUsed = usage?.usage.jobsCleanedToday ?? 0;
    const transcriptionsLimit = usage?.limits.dailyTranscriptionLimit ?? 5;

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

            {/* New Transcription Button - Prominent CTA */}
            <div className="p-3">
                <NewTranscriptionButton
                    isCollapsed={isCollapsed}
                    onClick={onNewTranscription}
                />
            </div>

            {/* Usage / Premium Status */}
            <div className="px-3 pb-3">
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

            {/* Get Premium CTA (free users only) - Prominent */}
            {!isPremium && (
                <div className="px-3 pb-3">
                    <Link href="/dashboard/subscription">
                        <div
                            className={cn(
                                "flex items-center gap-2 px-3 py-2.5 rounded-lg",
                                "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
                                "border border-amber-500/20",
                                "text-amber-600 dark:text-amber-400",
                                "hover:from-amber-500/20 hover:to-orange-500/20",
                                "transition-all duration-200 cursor-pointer",
                                isCollapsed && "justify-center px-2"
                            )}
                        >
                            <Sparkles className="h-4 w-4 shrink-0" />
                            {!isCollapsed && (
                                <span className="text-sm font-medium">Upgrade to Premium</span>
                            )}
                        </div>
                    </Link>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="p-2 space-y-1 border-t border-border">
                <NavItem
                    href="/dashboard"
                    icon={FileAudio}
                    label="My Transcriptions"
                    isCollapsed={isCollapsed}
                />
            </nav>

            {/* Folders Section */}
            <FolderSection isCollapsed={isCollapsed} />

            {/* Bottom Navigation - Settings (combined Account + Subscription) */}
            <div className="p-2 border-t border-border">
                <NavItem
                    href="/dashboard/settings"
                    icon={Settings}
                    label="Settings"
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

// ─────────────────────────────────────────────────────────────
// New Transcription Button - Prominent CTA with Gradient
// ─────────────────────────────────────────────────────────────

interface NewTranscriptionButtonProps {
    isCollapsed: boolean;
    onClick?: () => void;
}

function NewTranscriptionButton({ isCollapsed, onClick }: NewTranscriptionButtonProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <Link href="/dashboard?action=new" onClick={handleClick}>
            <div
                className={cn(
                    "flex items-center justify-center gap-2 w-full",
                    "px-4 py-3 rounded-xl",
                    "bg-gradient-to-r from-primary to-secondary",
                    "text-primary-foreground font-medium",
                    "shadow-lg shadow-primary/25",
                    "hover:shadow-xl hover:shadow-primary/30",
                    "hover:scale-[1.02]",
                    "active:scale-[0.98]",
                    "transition-all duration-200",
                    isCollapsed && "px-3 py-3"
                )}
            >
                <Plus className="h-5 w-5" />
                {!isCollapsed && <span>New Transcription</span>}
            </div>
        </Link>
    );
}

// ─────────────────────────────────────────────────────────────
// Folder Section
// ─────────────────────────────────────────────────────────────

interface FolderSectionProps {
    isCollapsed: boolean;
}

function FolderSection({ isCollapsed }: FolderSectionProps) {
    const router = useRouter();
    const { data: folders, isLoading } = useFolders();
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    if (isCollapsed) {
        return (
            <div className="p-2 border-t border-border">
                <div
                    className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                    title="Folders"
                >
                    <Folder className="h-5 w-5" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto border-t border-border">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Folders
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 transition-transform",
                        !isExpanded && "-rotate-90"
                    )}
                />
            </button>

            {isExpanded && (
                <div className="px-2 pb-2 space-y-0.5">
                    {/* Create Folder Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={cn(
                            "flex items-center gap-2 w-full px-3 py-1.5 rounded-md",
                            "text-sm text-primary hover:bg-primary/10",
                            "transition-colors"
                        )}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Create Folder
                    </button>

                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
                    ) : folders && folders.length > 0 ? (
                        folders.map((folder) => (
                            <FolderListItem
                                key={folder.id}
                                id={folder.id}
                                name={folder.name}
                                color={folder.color}
                                itemCount={folder.itemCount}
                                onClick={() => router.push(`/dashboard?folder=${folder.id}`)}
                            />
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No folders yet</div>
                    )}
                </div>
            )}

            {/* Folder Modal */}
            <FolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Folder List Item
// ─────────────────────────────────────────────────────────────

interface FolderListItemProps {
    id: string;
    name: string;
    color: FolderColor;
    itemCount: number;
    onClick: () => void;
}

function FolderListItem({ name, color, itemCount, onClick }: FolderListItemProps) {
    const colors = FOLDER_COLORS[color] || FOLDER_COLORS.Blue;

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 w-full px-3 py-1.5 rounded-md",
                "text-sm text-muted-foreground hover:text-foreground hover:bg-accent",
                "transition-colors"
            )}
        >
            <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: colors.border }}
            />
            <span className="truncate flex-1 text-left">{name}</span>
            <span className="text-xs text-muted-foreground/60">{itemCount}</span>
        </button>
    );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };

