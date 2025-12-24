"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

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
    return (
        <Link href={href}>
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
