"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";

export interface PricingButtonProps {
    children: React.ReactNode;
    href: string;
    highlighted?: boolean;
    className?: string;
}

// Reusable pricing card CTA button - consistent styling across landing and pricing pages
export function PricingButton({
    children,
    href,
    highlighted = false,
    className,
}: PricingButtonProps) {
    const { isAuthenticated } = useAuth();

    // If href points to signup, redirect based on auth state
    const targetHref = React.useMemo(() => {
        if (href.includes("/auth")) {
            return isAuthenticated ? "/dashboard" : href;
        }
        return href;
    }, [href, isAuthenticated]);

    return (
        <Link href={targetHref}>
            <Button
                variant={highlighted ? "default" : "outline"}
                size="lg"
                className={cn(
                    "w-full text-sm font-semibold uppercase tracking-wide",
                    highlighted && "bg-primary hover:bg-primary/90",
                    className
                )}
            >
                {children}
            </Button>
        </Link>
    );
}

