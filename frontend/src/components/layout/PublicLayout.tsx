import * as React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface PublicLayoutProps {
    children: React.ReactNode;
    /** Whether the user is authenticated */
    isAuthenticated?: boolean;
    /** User info for header avatar */
    user?: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

export function PublicLayout({
    children,
    isAuthenticated = false,
    user,
}: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header isAuthenticated={isAuthenticated} user={user} />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
        </div>
    );
}
