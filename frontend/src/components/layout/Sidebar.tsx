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
    Zap,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useUsage } from "@/hooks/useUsage";
import { useFolders, FOLDER_COLORS } from "@/hooks";
import { PlanType } from "@/types/api/usage";
import { FolderColor } from "@/types/models/folder";
import { FolderModal } from "@/features/folder";

interface SidebarProps {
    onNewTranscription?: () => void;
}

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 60;

export function Sidebar({ onNewTranscription }: SidebarProps) {
    const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
    const { data: usage } = useUsage();

    const isPremium = usage?.planType === PlanType.Pro;
    const transcriptionsUsed = usage?.usage.jobsCleanedToday ?? 0;
    const transcriptionsLimit = usage?.limits.dailyTranscriptionLimit ?? 5;

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Brand Header */}
            <div className="p-3 border-b border-border">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity",
                        isCollapsed && "justify-center"
                    )}
                >
                    <Mic2 className="h-6 w-6 text-primary shrink-0" />
                    {!isCollapsed && <span className="font-semibold">MicroScribe</span>}
                </Link>
            </div>

            {/* Upgrade Card (Free Users) - Hero CTA */}
            {!isPremium && !isCollapsed && (
                <div className="p-2 mb-1 mt-2">
                    <UpgradeCard />
                </div>
            )}

            {/* Usage*/}
            <div className="p-2 space-y-2">
                {!isPremium && (
                    <UsageIndicator
                        used={transcriptionsUsed}
                        limit={transcriptionsLimit}
                        isCollapsed={isCollapsed}
                    />
                )}
                {isPremium && !isCollapsed && <PremiumBadge />}
            </div>

            <div className="px-2 py-1 mt-10">
                <NewTranscriptionButton isCollapsed={isCollapsed} onClick={onNewTranscription} />
            </div>

            {/* Navigation */}
            <div className="mt-2">
                <SidebarSection>
                    <SidebarNavItem
                        href="/dashboard"
                        icon={FileAudio}
                        label="My Transcriptions"
                        isCollapsed={isCollapsed}
                    />
                </SidebarSection>

                {/* Folders */}
                <SidebarSection>
                    <FolderSection isCollapsed={isCollapsed} />
                </SidebarSection>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom - Settings */}
            <SidebarSection className="border-t border-border mt-auto">
                <SidebarNavItem
                    href="/dashboard/settings"
                    icon={Settings}
                    label="Settings"
                    isCollapsed={isCollapsed}
                />
            </SidebarSection>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 h-screen",
                    "bg-card border-r border-border",
                    "transition-[width] duration-200 ease-out"
                )}
                style={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Trigger */}
            <MobileTrigger />

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={closeMobile}>
                    <aside
                        className="fixed left-0 top-0 h-full w-[260px] bg-card animate-slide-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-3 right-3">
                            <button onClick={closeMobile} className="p-1.5 text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            {/* Spacer */}
            <div
                className="hidden lg:block shrink-0 transition-[width] duration-200"
                style={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────
// Upgrade Card - Vibrant Hero CTA
// ─────────────────────────────────────────────────────────────

function UpgradeCard() {
    return (
        <Link href="/dashboard/subscription">
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl p-4",
                    "bg-gradient-to-br from-primary via-secondary to-primary",
                    "text-primary-foreground",
                    "shadow-lg shadow-primary/25",
                    "hover:shadow-xl hover:shadow-primary/35",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "transition-all duration-200"
                )}
            >
                {/* Shimmer sweep effect */}
                <div
                    className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: "shimmer 3s ease-in-out infinite" }}
                />

                {/* Glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />

                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-bold">Go Premium</span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">Unlimited transcriptions</p>
                    <div className="flex items-center gap-1.5 text-xs opacity-80">
                        <Check className="h-3 w-3" />
                        <span>No daily limits</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─────────────────────────────────────────────────────────────
// Usage Indicator - Ring Progress
// ─────────────────────────────────────────────────────────────

interface UsageIndicatorProps {
    used: number;
    limit: number;
    isCollapsed: boolean;
}

function UsageIndicator({ used, limit, isCollapsed }: UsageIndicatorProps) {
    const percentage = Math.min((used / limit) * 100, 100);
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    if (isCollapsed) {
        return (
            <div className="flex justify-center" title={`${used}/${limit} today`}>
                <svg width="36" height="36" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle
                        cx="18"
                        cy="18"
                        r={radius}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 18 18)"
                    />
                    <text x="18" y="18" textAnchor="middle" dy="0.35em"
                        className="text-[10px] fill-foreground font-medium">
                        {used}
                    </text>
                </svg>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50">
            <svg width="28" height="28" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 18 18)"
                />
            </svg>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{used}/{limit} today</div>
                <div className="text-[10px] text-muted-foreground">Daily usage</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Premium Badge
// ─────────────────────────────────────────────────────────────

function PremiumBadge() {
    return (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">Unlimited</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// New Transcription Button
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
                    "px-3 py-2 rounded-lg",
                    "bg-primary text-primary-foreground",
                    "font-medium text-sm",
                    "hover:bg-primary/90",
                    "hover:translate-y-[-1px] hover:shadow-md",
                    "active:translate-y-0 active:shadow-sm",
                    "transition-all duration-150",
                    isCollapsed && "px-2"
                )}
            >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span>New</span>}
            </div>
        </Link>
    );
}

// ─────────────────────────────────────────────────────────────
// Sidebar Section Wrapper
// ─────────────────────────────────────────────────────────────

interface SidebarSectionProps {
    children: React.ReactNode;
    className?: string;
}

function SidebarSection({ children, className }: SidebarSectionProps) {
    return (
        <div className={cn("px-2 py-1.5", className)}>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Sidebar Navigation Item
// ─────────────────────────────────────────────────────────────

interface SidebarNavItemProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isCollapsed: boolean;
}

function SidebarNavItem({ href, icon: Icon, label, isCollapsed }: SidebarNavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md",
                "text-sm font-medium text-muted-foreground",
                "hover:text-foreground hover:bg-accent",
                "transition-colors duration-150",
                isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? label : undefined}
        >
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );
}

// Keep NavItem for backwards compatibility
function NavItem(props: SidebarNavItemProps) {
    return <SidebarNavItem {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Mobile Trigger
// ─────────────────────────────────────────────────────────────

function MobileTrigger() {
    const { openMobile } = useSidebar();

    return (
        <button
            type="button"
            onClick={openMobile}
            className={cn(
                "lg:hidden fixed top-3 left-3 z-40",
                "p-2 rounded-md",
                "bg-card border border-border shadow-sm",
                "text-muted-foreground hover:text-foreground",
                "transition-colors"
            )}
        >
            <Menu className="h-5 w-5" />
        </button>
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
            <div className="px-2 py-1">
                <div
                    className="flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                    title="Folders"
                >
                    <Folder className="h-4 w-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "flex items-center justify-between w-full rounded-md",
                    "px-2.5 py-2",
                    "text-sm font-medium text-muted-foreground",
                    "hover:text-foreground hover:bg-accent",
                    "transition-colors duration-150"
                )}
            >
                <span className="flex items-center gap-2.5">
                    <Folder className="h-4 w-4" />
                    Folders
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !isExpanded && "-rotate-90")} />
            </button>

            {isExpanded && (
                <div className="px-1.5 pb-1 space-y-0.5">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={cn(
                            "flex items-center gap-2.5 w-full rounded-md",
                            "px-2.5 py-2",
                            "text-sm text-muted-foreground",
                            "hover:text-foreground hover:bg-accent",
                            "transition-colors duration-150"
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        Create Folder
                    </button>

                    {isLoading ? (
                        <div className="px-2 py-1 text-xs text-muted-foreground">Loading...</div>
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
                        <div className="px-2 py-1 text-xs text-muted-foreground">No folders</div>
                    )}
                </div>
            )}

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
                "flex items-center gap-2.5 w-full rounded-md",
                "px-2.5 py-2",
                "text-sm text-muted-foreground",
                "hover:text-foreground hover:bg-accent",
                "transition-colors duration-150"
            )}
        >
            <div
                className="w-3 h-3 rounded shrink-0"
                style={{ backgroundColor: colors.border }}
            />
            <span className="truncate flex-1 text-left">{name}</span>
            <span className="text-xs text-muted-foreground/70 tabular-nums">{itemCount}</span>
        </button>
    );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
