import * as React from "react";
import Link from "next/link";
import { Mic2, Twitter, Github } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
    product: [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/api-docs", label: "API Docs" },
    ],
    legal: [
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/cookies", label: "Cookie Policy" },
    ],
    social: [
        { href: "https://twitter.com", label: "Twitter", icon: Twitter },
        { href: "https://github.com", label: "GitHub", icon: Github },
    ],
};

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
                        >
                            <Mic2 className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold">ScribeRocket</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Transcription made easy. Powered by OpenAI Whisper for accurate,
                            fast audio-to-text conversion.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                            Product
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <FooterLink href={link.href}>{link.label}</FooterLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <FooterLink href={link.href}>{link.label}</FooterLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                            Connect
                        </h3>
                        <div className="flex items-center gap-4">
                            {footerLinks.social.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "p-2 rounded-md",
                                        "text-muted-foreground hover:text-foreground hover:bg-accent",
                                        "transition-colors duration-[var(--transition-fast)]"
                                    )}
                                    aria-label={link.label}
                                >
                                    <link.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} ScribeRocket. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({
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
                "text-sm text-muted-foreground",
                "hover:text-foreground transition-colors duration-[var(--transition-fast)]"
            )}
        >
            {children}
        </Link>
    );
}
