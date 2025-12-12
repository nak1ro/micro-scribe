"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

interface HeaderProps {
    /** Whether the user is authenticated */
    isAuthenticated?: boolean;
    /** User info for avatar (when authenticated) */
    user?: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
];

export function Header({ isAuthenticated = false, user }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50",
                "h-16 border-b border-border",
                "bg-background/80 backdrop-blur-md",
                "transition-all duration-[var(--transition-fast)] ease-[var(--easing-soft)]"
            )}
        >
            <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-full items-center justify-between">
                    {/* Left: Logo + Nav */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
                        >
                            <Mic2 className="h-7 w-7 text-primary" />
                            <span className="hidden sm:block text-lg font-semibold">
                                MicroScribe
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative text-sm font-medium text-muted-foreground",
                                        "hover:text-foreground transition-colors duration-[var(--transition-fast)]",
                                        "after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-primary",
                                        "after:transition-all after:duration-[var(--transition-fast)] after:ease-[var(--easing-soft)]",
                                        "hover:after:w-full"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right: Auth buttons or User menu */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated && user ? (
                            <UserMenu user={user} />
                        ) : (
                            <>
                                <Link href="/auth?mode=login" className="hidden sm:block">
                                    <Button variant="ghost" size="sm">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/auth?mode=signup">
                                    <Button size="sm">Sign up</Button>
                                </Link>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <MobileMenu
                    navLinks={navLinks}
                    isAuthenticated={isAuthenticated}
                    onClose={() => setIsMobileMenuOpen(false)}
                />
            )}
        </header>
    );
}

// ─────────────────────────────────────────────────────────────
// User Menu (Avatar Dropdown)
// ─────────────────────────────────────────────────────────────

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-primary text-primary-foreground text-sm font-medium",
                    "hover:opacity-90 transition-opacity",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    initials
                )}
            </button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute right-0 top-full mt-2 w-56",
                        "rounded-lg border border-border bg-card shadow-lg",
                        "animate-slide-in-up"
                    )}
                >
                    <div className="p-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="p-1">
                        <DropdownLink href="/dashboard">Dashboard</DropdownLink>
                        <DropdownLink href="/dashboard/account">Account</DropdownLink>
                        <DropdownLink href="/dashboard/subscription">
                            Subscription
                        </DropdownLink>
                    </div>
                    <div className="p-1 border-t border-border">
                        <button
                            type="button"
                            className={cn(
                                "w-full px-3 py-2 text-left text-sm rounded-md",
                                "text-destructive hover:bg-destructive/10 transition-colors"
                            )}
                            onClick={() => {
                                // TODO: Implement sign out
                                console.log("Sign out clicked");
                            }}
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DropdownLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "block px-3 py-2 text-sm rounded-md",
                "text-foreground hover:bg-accent transition-colors"
            )}
        >
            {children}
        </Link>
    );
}

// ─────────────────────────────────────────────────────────────
// Mobile Menu
// ─────────────────────────────────────────────────────────────

interface MobileMenuProps {
    navLinks: { href: string; label: string }[];
    isAuthenticated: boolean;
    onClose: () => void;
}

function MobileMenu({ navLinks, isAuthenticated, onClose }: MobileMenuProps) {
    return (
        <div
            className={cn(
                "md:hidden absolute top-full left-0 right-0",
                "border-b border-border bg-background",
                "animate-slide-in-up"
            )}
        >
            <nav className="flex flex-col p-4 gap-2">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "px-3 py-2 text-sm font-medium rounded-md",
                            "text-muted-foreground hover:text-foreground hover:bg-accent",
                            "transition-colors"
                        )}
                        onClick={onClose}
                    >
                        {link.label}
                    </Link>
                ))}
                {!isAuthenticated && (
                    <Link
                        href="/auth?mode=login"
                        className={cn(
                            "px-3 py-2 text-sm font-medium rounded-md",
                            "text-muted-foreground hover:text-foreground hover:bg-accent",
                            "transition-colors sm:hidden"
                        )}
                        onClick={onClose}
                    >
                        Log in
                    </Link>
                )}
            </nav>
        </div>
    );
}
