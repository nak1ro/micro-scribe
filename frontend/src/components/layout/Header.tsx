"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, CreditCard, User, LogOut, Sun, Moon } from "lucide-react";
import { Rocket } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How it Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
];

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { user, isAuthenticated, isLoading } = useAuth();

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
                        {/* Logo with hover effects */}
                        <Link
                            href="/"
                            className="group flex items-center gap-2 text-foreground"
                        >
                            {/* Animated rocket icon */}
                            <span className="relative">
                                <Rocket
                                    className={cn(
                                        "h-7 w-7 text-primary",
                                        "transition-transform duration-300 ease-out",
                                        "group-hover:rotate-[-15deg] group-hover:scale-110"
                                    )}
                                />
                                {/* Sparkle effect on hover */}
                                <span className={cn(
                                    "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                                    "bg-primary/80 opacity-0 scale-0",
                                    "group-hover:opacity-100 group-hover:scale-100",
                                    "transition-all duration-300 delay-100",
                                    "animate-ping"
                                )} />
                            </span>
                            {/* Gradient text on hover */}
                            <span className={cn(
                                "hidden sm:block text-lg font-semibold",
                                "transition-all duration-300",
                                "group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/60",
                                "group-hover:bg-clip-text group-hover:text-transparent"
                            )}>
                                ScribeRocket
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

                    {/* Right: Dashboard + Auth buttons or User menu */}
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                        ) : isAuthenticated && user ? (
                            <>
                                <Link href="/dashboard" className="hidden sm:block">
                                    <Button variant="ghost" size="md" className="gap-2">
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <UserMenu
                                    user={{
                                        name: user.email.split("@")[0],
                                        email: user.email,
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                <ThemeToggle />
                                <Link href="/auth?mode=login" className="hidden sm:block">
                                    <Button variant="ghost" size="md" className="text-base px-5">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/auth?mode=signup">
                                    <Button size="md" className="text-base px-5 animate-glow-border">
                                        Sign up
                                    </Button>
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
                    user={user}
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
    const router = useRouter();
    const { logout } = useAuth();

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
        .slice(0, 2) || "U";

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

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
                        <DropdownLink href="/dashboard" icon={LayoutDashboard}>
                            Dashboard
                        </DropdownLink>
                        <DropdownLink href="/dashboard/subscription" icon={CreditCard}>
                            Manage Subscription
                        </DropdownLink>
                        <DropdownLink href="/dashboard/account" icon={User}>
                            Account
                        </DropdownLink>
                        <ThemeMenuButton />
                    </div>
                    <div className="p-1 border-t border-border">
                        <button
                            type="button"
                            className={cn(
                                "flex items-center gap-2 w-full px-3 py-2 text-left text-sm rounded-md",
                                "text-destructive hover:bg-destructive/10 transition-colors"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DropdownLink({
    href,
    icon: Icon,
    children,
}: {
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                "text-foreground hover:bg-accent transition-colors"
            )}
        >
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            {children}
        </Link>
    );
}

// Theme toggle button styled like dropdown menu items
function ThemeMenuButton() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-foreground">
                <Sun className="h-4 w-4 text-muted-foreground" />
                Theme
            </div>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left text-sm rounded-md",
                "text-foreground hover:bg-accent transition-colors"
            )}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            {isDark ? "Light mode" : "Dark mode"}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// Mobile Menu
// ─────────────────────────────────────────────────────────────

interface MobileMenuProps {
    navLinks: { href: string; label: string }[];
    isAuthenticated: boolean;
    user?: { email: string } | null;
    onClose: () => void;
}

function MobileMenu({ navLinks, isAuthenticated, user, onClose }: MobileMenuProps) {
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
