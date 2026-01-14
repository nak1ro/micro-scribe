"use client";

import Link from "next/link";
import { AuthMode } from "./AuthTabs";

interface AuthFooterProps {
    mode: AuthMode;
}

export function AuthFooter({ mode }: AuthFooterProps) {
    return (
        <footer className="px-6 pb-6 pt-2 text-center border-t border-border">
            <p className="text-sm text-muted-foreground">
                {mode === "login" ? (
                    <>
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth?mode=signup"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <Link
                            href="/auth?mode=login"
                            className="text-primary font-medium hover:underline"
                        >
                            Log in
                        </Link>
                    </>
                )}
            </p>
        </footer>
    );
}
