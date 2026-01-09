"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    Microphone,
    Sparks,
    SidebarCollapse,
    SidebarExpand,
    MusicDoubleNote,
    Plus,
    User,
    Folder,
    NavArrowDown,
    Check,
    MoreVert,
    EditPencil,
    Trash,
    ArrowLeft,
} from "iconoir-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useUsage } from "@/hooks/useUsage";
import { useFolders, useDeleteFolder, FOLDER_COLORS } from "@/hooks";
import { PlanType } from "@/types/api/usage";
import { FolderColor } from "@/types/models/folder";
import { FolderModal } from "@/features/workspace/folders";
import { VerificationBanner } from "@/components/common/VerificationBanner";

interface SidebarProps {
    onNewTranscription?: () => void;
}

const SIDEBAR_WIDTH = 245;
const SIDEBAR_COLLAPSED_WIDTH = 68;

export function Sidebar({ onNewTranscription }: SidebarProps) {
    const { isCollapsed, toggleCollapse, setCollapsed } = useSidebar();
    const { data: usage } = useUsage();
    const pathname = usePathname();

    // Auto-collapse logic based on route
    React.useEffect(() => {
        if (pathname?.includes("/transcriptions/")) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [pathname, setCollapsed]);

    const isPremium = usage?.planType === PlanType.Pro;
    const transcriptionsUsed = usage?.usage.jobsCleanedToday ?? 0;
    const transcriptionsLimit = usage?.limits.dailyTranscriptionLimit ?? 5;

    // Check if we are in transcription view
    const isTranscriptionView = pathname?.includes("/transcriptions/");

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
                            <Microphone className="h-7 w-7 text-primary shrink-0" />
                            <span className="font-semibold text-base">ScribeRocket</span>
                        </Link>
                        {isTranscriptionView ? (
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="Back to Dashboard"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <button
                                onClick={toggleCollapse}
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="Collapse sidebar"
                            >
                                <SidebarCollapse className="h-4 w-4" />
                            </button>
                        )}
                    </>
                ) : (
                    isTranscriptionView ? (
                        <Link
                            href="/dashboard"
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            aria-label="Back to Dashboard"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    ) : (
                        <button
                            onClick={toggleCollapse}
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            aria-label="Expand sidebar"
                        >
                            <SidebarExpand className="h-5 w-5" />
                        </button>
                    )
                )}
            </div>

            {/* Email Verification Banner */}
            {!isCollapsed && <VerificationBanner />}

            {/* Upgrade Card (Free Users) - Hero CTA */}
            {!isPremium && !isCollapsed && (
                <div className="px-4 py-2 mt-4">
                    <UpgradeCard />
                </div>
            )}

            {/* Usage*/}
            <div className={cn(
                "mt-5 space-y-2",
                isCollapsed ? "px-3 py-1.5" : "px-4 py-2"
            )}>
                {!isPremium && (
                    <UsageIndicator
                        used={transcriptionsUsed}
                        limit={transcriptionsLimit}
                        isCollapsed={isCollapsed}
                    />
                )}
                {isPremium && !isCollapsed && <PremiumBadge />}
            </div>

            <div className={cn(
                isCollapsed ? "px-3 mt-7 mb-7" : "px-4 mt-8 mb-8"
            )}>
                <NewTranscriptionButton isCollapsed={isCollapsed} onClick={onNewTranscription} />
            </div>

            {/* Navigation */}
            <SidebarSection>
                <SidebarNavItem
                    href="/dashboard"
                    icon={MusicDoubleNote}
                    label="My Transcriptions"
                    isCollapsed={isCollapsed}
                />
            </SidebarSection>

            {/* Bottom - Account */}
            <SidebarSection className="border-t border-border mt-auto pb-4">
                <SidebarNavItem
                    href="/account"
                    icon={User}
                    label="Account"
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

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                onNewTranscription={onNewTranscription}
                isPremium={isPremium}
            />

            {/* Spacer for desktop */}
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
        <a href="/account/checkout">
            <div
                className={cn(
                    "relative overflow-hidden rounded-xl p-4",
                    "bg-gradient-primary from-primary via-secondary to-primary",
                    "text-primary-foreground",
                    "shadow-lg shadow-primary/25",
                    "hover:shadow-xl hover:shadow-primary/35",
                    "hover:shadow-xl hover:shadow-primary/35",
                    "transition-all duration-200"
                )}
            >
                {/* Shimmer sweep effect */}
                <div
                    className={cn(
                        "absolute inset-0",
                        "bg-gradient-to-r from-transparent via-white/20 to-transparent",
                        "animate-[shimmer_3s_ease-in-out_infinite]",
                        "-translate-x-full"
                    )}
                />

                {/* Content */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparks className="h-5 w-5" />
                        <span className="font-bold text-sm">Go Premium</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-90">
                        <Check className="h-3.5 w-3.5" />
                        <span>No daily limits</span>
                    </div>
                </div>
            </div>
        </a>
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
    const remaining = Math.max(0, limit - used);
    const percentage = Math.min((used / limit) * 100, 100);

    // Status color based on remaining usage
    const getStatusColor = () => {
        if (remaining === 0) return "hsl(var(--destructive))";
        if (remaining <= 2) return "hsl(45 93% 47%)";
        return "hsl(var(--primary))";
    };

    // Parameters for the ring indicator
    const collapsedRadius = 10;
    const collapsedCircumference = 2 * Math.PI * collapsedRadius;
    const collapsedStrokeDashoffset = collapsedCircumference - (percentage / 100) * collapsedCircumference;

    const expandedRadius = 14;
    const expandedCircumference = 2 * Math.PI * expandedRadius;
    const expandedStrokeDashoffset = expandedCircumference - (percentage / 100) * expandedCircumference;

    if (isCollapsed) {
        return (
            <div className="flex items-center justify-center">
                <a
                    href="/account/checkout"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Go Premium"
                >
                    <Sparks className="h-5 w-5" />
                </a>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
            <svg width="32" height="32" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r={expandedRadius} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                    cx="18"
                    cy="18"
                    r={expandedRadius}
                    fill="none"
                    stroke={getStatusColor()}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={expandedCircumference}
                    strokeDashoffset={expandedStrokeDashoffset}
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
        <Link href="/account/billing">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer">
                <Sparks className="h-5 w-5" />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Pro Plan</div>
                    <div className="text-xs text-primary/70">Unlimited usage</div>
                </div>
            </div>
        </Link>
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
    // Use VerificationContext for email verification check
    const { VerificationContext } = require("@/context/VerificationContext");
    const verificationContext = React.useContext(VerificationContext) as { isVerified: boolean; openModal: () => void } | undefined;
    const isVerified = verificationContext?.isVerified ?? true;
    const openModal = verificationContext?.openModal;

    const handleClick = (e: React.MouseEvent) => {
        // Block upload for unverified users
        if (!isVerified) {
            e.preventDefault();
            openModal?.();
            return;
        }

        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };

    if (isCollapsed) {
        return (
            <Link href="/dashboard?action=new" onClick={handleClick}>
                <div
                    className={cn(
                        "w-10 h-10 mx-auto flex items-center justify-center rounded-lg",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 transition-colors"
                    )}
                >
                    <Plus className="h-5 w-5" />
                </div>
            </Link>
        );
    }

    return (
        <Link href="/dashboard?action=new" onClick={handleClick}>
            <div
                className={cn(
                    "flex items-center justify-center gap-2 w-full",
                    "px-4 py-2.5 rounded-lg",
                    "bg-gradient-primary text-primary-foreground",
                    "font-medium text-sm",
                    "hover:bg-primary/90 transition-all duration-150"
                )}
            >
                <Plus className="h-5 w-5" />
                <span>New</span>
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
    if (isCollapsed) {
        return (
            <Link
                href={href}
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title={label}
            >
                <Icon className="h-5 w-5" />
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-sm font-medium text-muted-foreground",
                "hover:text-foreground hover:bg-accent",
                "transition-colors duration-150"
            )}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
        </Link>
    );
}

// Keep NavItem for backwards compatibility
function NavItem(props: SidebarNavItemProps) {
    return <SidebarNavItem {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Mobile Bottom Navigation
// ─────────────────────────────────────────────────────────────

interface MobileBottomNavProps {
    onNewTranscription?: () => void;
    isPremium: boolean;
}

function MobileBottomNav({ onNewTranscription, isPremium }: MobileBottomNavProps) {
    const pathname = usePathname();

    const handleNewClick = (e: React.MouseEvent) => {
        if (onNewTranscription) {
            e.preventDefault();
            onNewTranscription();
        }
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard" || pathname?.startsWith("/transcriptions/");
        }
        return pathname === href || pathname?.startsWith(href);
    };

    // Hide bottom nav in transcription viewer (immersive mode)
    // Only show on dashboard, settings, and new transcription page
    const isTranscriptionsViewer = pathname?.startsWith('/transcriptions/') && pathname !== '/transcriptions/new';

    if (isTranscriptionsViewer) {
        return null;
    }

    return (
        <nav
            className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 z-50",
                "bg-card/95 backdrop-blur-md border-t border-border",
                "pb-[env(safe-area-inset-bottom)]"
            )}
        >
            <div className="flex items-center justify-around h-18 px-2">
                {/* Transcriptions */}
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 min-w-[64px] rounded-lg relative",
                        "text-muted-foreground hover:text-foreground transition-all duration-300",
                        isActive("/dashboard") && "text-primary"
                    )}
                >
                    <MusicDoubleNote className={cn("h-6 w-6 transition-transform duration-300", isActive("/dashboard") && "scale-110")} />
                    <span className="text-[10px] font-medium">Files</span>
                    <span className={cn(
                        "absolute -bottom-1 w-1 h-1 rounded-full bg-primary transition-all duration-300",
                        isActive("/dashboard") ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    )} />
                </Link>

                {/* New Transcription - Center Button */}
                <Link
                    href="/dashboard?action=new"
                    onClick={handleNewClick}
                    className={cn(
                        "flex items-center justify-center",
                        "w-12 h-12 rounded-full",
                        "bg-gradient-primary text-primary-foreground",
                        "shadow-lg shadow-primary/25",
                        "active:scale-95 transition-transform"
                    )}
                    aria-label="New transcription"
                >
                    <Plus className="h-6 w-6" />
                </Link>

                {/* Account */}
                <Link
                    href="/account"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 min-w-[64px] rounded-lg relative",
                        "text-muted-foreground hover:text-foreground transition-all duration-300",
                        (isActive("/account") && !isActive("/account/billing") && !isActive("/account/checkout")) && "text-primary"
                    )}
                >
                    <User className={cn("h-6 w-6 transition-transform duration-300", (isActive("/account") && !isActive("/account/billing") && !isActive("/account/checkout")) && "scale-110")} />
                    <span className="text-[10px] font-medium">Account</span>
                    <span className={cn(
                        "absolute -bottom-1 w-1 h-1 rounded-full bg-primary transition-all duration-300",
                        (isActive("/account") && !isActive("/account/billing") && !isActive("/account/checkout")) ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    )} />
                </Link>

                {/* Upgrade (for free users) / Premium badge */}
                {!isPremium ? (
                    <a
                        href="/account/checkout"
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 min-w-[64px] rounded-lg relative",
                            "text-muted-foreground hover:text-foreground transition-all duration-300",
                            isActive("/account/checkout") && "text-primary"
                        )}
                    >
                        <Sparks className={cn("h-6 w-6 transition-transform duration-300", isActive("/account/checkout") && "scale-110")} />
                        <span className="text-[10px] font-medium">Upgrade</span>
                        <span className={cn(
                            "absolute -bottom-1 w-1 h-1 rounded-full bg-primary transition-all duration-300",
                            isActive("/account/checkout") ? "opacity-100 scale-100" : "opacity-0 scale-0"
                        )} />
                    </a>
                ) : (
                    <Link
                        href="/account/billing"
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 min-w-[64px] rounded-lg relative",
                            "text-muted-foreground hover:text-foreground transition-all duration-300",
                            isActive("/account/billing") && "text-primary"
                        )}
                    >
                        <Sparks className={cn("h-6 w-6 transition-transform duration-300", isActive("/account/billing") && "scale-110")} />
                        <span className="text-[10px] font-medium">Pro</span>
                        <span className={cn(
                            "absolute -bottom-1 w-1 h-1 rounded-full bg-primary transition-all duration-300",
                            isActive("/account/billing") ? "opacity-100 scale-100" : "opacity-0 scale-0"
                        )} />
                    </Link>
                )}
            </div>
        </nav>
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

    // Verification context for folder actions
    const { VerificationContext } = require("@/context/VerificationContext");
    const verificationContext = React.useContext(VerificationContext) as { isVerified: boolean; openModal: () => void } | undefined;
    const isVerified = verificationContext?.isVerified ?? true;
    const openVerificationModal = verificationContext?.openModal;

    const handleCreateFolder = () => {
        if (!isVerified) {
            openVerificationModal?.();
            return;
        }
        setEditingFolder(null);
        setIsModalOpen(true);
    };

    const handleEdit = (folder: typeof editingFolder) => {
        if (!isVerified) {
            openVerificationModal?.();
            return;
        }
        setEditingFolder(folder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFolder(null);
    };

    const handleDelete = async (folderId: string) => {
        if (!isVerified) {
            openVerificationModal?.();
            return;
        }
        try {
            await deleteFolderMutation.mutateAsync(folderId);
        } catch (error) {
            console.error("Failed to delete folder:", error);
        }
    };

    if (isCollapsed) {
        return (
            <div className="flex items-center justify-center">
                <div
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                    title="Folders"
                >
                    <Folder className="h-5 w-5" />
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
                <NavArrowDown className={cn("h-3.5 w-3.5 transition-transform", !isExpanded && "-rotate-90")} />
            </button>

            {isExpanded && (
                <div className="px-1.5 pb-1 space-y-0.5">
                    <button
                        onClick={handleCreateFolder}
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
                    <MoreVert className="h-4 w-4" />
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
                                <EditPencil className="h-3.5 w-3.5" />
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
                                <Trash className="h-3.5 w-3.5" />
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
