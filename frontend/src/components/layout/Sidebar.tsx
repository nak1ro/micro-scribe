"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    Mic2,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    PanelLeftClose,
    PanelLeftOpen,
    X,
    Menu,
    FileAudio,
    Plus,
    Settings,
    Folder,
    ChevronDown,
    Zap,
    Check,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useUsage } from "@/hooks/useUsage";
import { useFolders, useDeleteFolder, FOLDER_COLORS } from "@/hooks";
import { PlanType } from "@/types/api/usage";
import { FolderColor } from "@/types/models/folder";
import { FolderModal } from "@/features/folder";

interface SidebarProps {
    onNewTranscription?: () => void;
}

const SIDEBAR_WIDTH = 245;
const SIDEBAR_COLLAPSED_WIDTH = 68;

export function Sidebar({ onNewTranscription }: SidebarProps) {
    const { isCollapsed, isMobileOpen, toggleCollapse, setCollapsed, closeMobile } = useSidebar();
    const { data: usage } = useUsage();
    const pathname = usePathname();

    // Auto-collapse logic based on route
    React.useEffect(() => {
        if (pathname?.includes("/transcriptions/")) {
            setCollapsed(true);
        } else {
            // "When opens dashboard again, it becomes full again"
            // This assumes we want to expand on ANY non-transcription page, or strictly checks for dashboard/root
            setCollapsed(false);
        }
    }, [pathname, setCollapsed]);

    const isPremium = usage?.planType === PlanType.Pro;
    const transcriptionsUsed = usage?.usage.jobsCleanedToday ?? 0;
    const transcriptionsLimit = usage?.limits.dailyTranscriptionLimit ?? 5;

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Brand Header */}
            <div className={cn(
                "h-16 flex items-center border-b border-border",
                isCollapsed ? "justify-center px-0" : "justify-between px-4"
            )}>
                {!isCollapsed ? (
                    <>
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
                        >
                            <Mic2 className="h-7 w-7 text-primary shrink-0" />
                            <span className="font-semibold text-base">MicroScribe</span>
                        </Link>
                        <button
                            onClick={toggleCollapse}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={toggleCollapse}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Expand sidebar"
                    >
                        <PanelLeftOpen className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Upgrade Card (Free Users) - Hero CTA */}
            {!isPremium && !isCollapsed && (
                <div className="px-4 py-2 mt-2">
                    <UpgradeCard />
                </div>
            )}

            {/* Usage*/}
            <div className="px-4 py-2 space-y-2">
                {!isPremium && (
                    <UsageIndicator
                        used={transcriptionsUsed}
                        limit={transcriptionsLimit}
                        isCollapsed={isCollapsed}
                    />
                )}
                {isPremium && !isCollapsed && <PremiumBadge />}
            </div>

            <div className="px-4 mt-8 mb-8">
                <NewTranscriptionButton isCollapsed={isCollapsed} onClick={onNewTranscription} />
            </div>

            {/* Navigation */}
            <SidebarSection>
                <SidebarNavItem
                    href="/dashboard"
                    icon={FileAudio}
                    label="My Transcriptions"
                    isCollapsed={isCollapsed}
                />
            </SidebarSection>

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
                    "relative overflow-hidden rounded-xl p-4",
                    "bg-gradient-to-br from-primary via-secondary to-primary",
                    "text-primary-foreground",
                    "shadow-lg shadow-primary/25",
                    "hover:shadow-xl hover:shadow-primary/35",
                    "hover:shadow-xl hover:shadow-primary/35",
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
                        <Sparkles className="h-5 w-5" />
                        <span className="font-bold text-sm">Go Premium</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">Unlimited transcriptions</p>
                    <div className="flex items-center gap-1.5 text-sm opacity-80">
                        <Check className="h-3.5 w-3.5" />
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <svg width="32" height="32" viewBox="0 0 36 36">
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
                <div className="text-sm font-medium">{used}/{limit} today</div>
                <div className="text-xs text-muted-foreground">Daily usage</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Premium Badge
// ─────────────────────────────────────────────────────────────

function PremiumBadge() {
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Unlimited</span>
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
                    "px-4 py-2.5 rounded-lg",
                    "bg-primary text-primary-foreground",
                    "font-medium text-sm",
                    "hover:bg-primary/90",
                    "hover:bg-primary/90",
                    "transition-all duration-150",
                    isCollapsed && "px-2"
                )}
            >
                <Plus className="h-5 w-5" />
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
        <div className={cn("px-3 py-2", className)}>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-sm font-medium text-muted-foreground",
                "hover:text-foreground hover:bg-accent",
                "transition-colors duration-150",
                isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? label : undefined}
        >
            <Icon className="h-5 w-5 shrink-0" />
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
                "p-2 rounded-lg",
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
    const deleteFolderMutation = useDeleteFolder();
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingFolder, setEditingFolder] = React.useState<{
        id: string;
        name: string;
        color: FolderColor;
        itemCount: number;
        createdAtUtc: string;
    } | null>(null);

    const handleEdit = (folder: typeof editingFolder) => {
        setEditingFolder(folder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFolder(null);
    };

    const handleDelete = async (folderId: string) => {
        try {
            await deleteFolderMutation.mutateAsync(folderId);
        } catch (error) {
            console.error("Failed to delete folder:", error);
        }
    };

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
                    "flex items-center justify-between w-full rounded-lg",
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
                        onClick={() => {
                            setEditingFolder(null);
                            setIsModalOpen(true);
                        }}
                        className={cn(
                            "flex items-center gap-2.5 w-full rounded-lg",
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
                                onEdit={() => handleEdit(folder)}
                                onDelete={() => handleDelete(folder.id)}
                            />
                        ))
                    ) : (
                        <div className="px-2 py-1 text-xs text-muted-foreground">No folders</div>
                    )}
                </div>
            )}

            <FolderModal isOpen={isModalOpen} onClose={handleCloseModal} folder={editingFolder} />
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
    onEdit: () => void;
    onDelete: () => void;
}

function FolderListItem({ name, color, itemCount, onClick, onEdit, onDelete }: FolderListItemProps) {
    const colors = FOLDER_COLORS[color] || FOLDER_COLORS.Blue;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close menu on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
                setIsConfirmingDelete(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
        setIsConfirmingDelete(false);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onEdit();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmingDelete(true);
    };

    const handleConfirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsConfirmingDelete(false);
        onDelete();
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmingDelete(false);
    };

    return (
        <div className="relative group" ref={menuRef}>
            <div
                className={cn(
                    "flex items-center gap-2.5 w-full rounded-lg",
                    "px-2.5 py-2",
                    "text-sm text-muted-foreground",
                    "hover:text-foreground hover:bg-accent",
                    "transition-colors duration-150 cursor-pointer"
                )}
            >
                <div
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                    onClick={onClick}
                >
                    <Folder
                        className="h-4 w-4 shrink-0"
                        style={{ color: colors.border }}
                    />
                    <span className="truncate flex-1 text-left">{name}</span>
                </div>

                {/* Item count - hidden on hover */}
                <span className="text-xs text-muted-foreground/70 tabular-nums group-hover:hidden">
                    {itemCount}
                </span>

                {/* 3-dot menu button - visible on hover */}
                <button
                    type="button"
                    onClick={handleMenuClick}
                    className={cn(
                        "p-1 rounded-md hidden group-hover:flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground hover:bg-muted",
                        "transition-colors"
                    )}
                >
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div
                    className={cn(
                        "absolute right-0 top-full mt-1 z-50",
                        "min-w-[140px] py-1",
                        "bg-popover border border-border rounded-lg shadow-lg"
                    )}
                >
                    {!isConfirmingDelete ? (
                        <>
                            <button
                                onClick={handleEditClick}
                                className={cn(
                                    "flex items-center gap-2 w-full px-3 py-2 text-sm",
                                    "text-foreground hover:bg-accent",
                                    "transition-colors"
                                )}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className={cn(
                                    "flex items-center gap-2 w-full px-3 py-2 text-sm",
                                    "text-destructive hover:bg-destructive/10",
                                    "transition-colors"
                                )}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </button>
                        </>
                    ) : (
                        <div className="px-3 py-2 space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Delete folder?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleConfirmDelete}
                                    className={cn(
                                        "flex-1 px-2 py-1 text-xs font-medium rounded",
                                        "bg-destructive text-destructive-foreground",
                                        "hover:bg-destructive/90 transition-colors"
                                    )}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={handleCancelDelete}
                                    className={cn(
                                        "flex-1 px-2 py-1 text-xs font-medium rounded",
                                        "bg-muted text-muted-foreground",
                                        "hover:bg-accent transition-colors"
                                    )}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
