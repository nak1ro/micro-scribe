"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "iconoir-react";
import { cn } from "@/lib/utils";

// CTA Button sizes - consistent padding and text sizing
const sizeVariants = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-6 text-lg",
};

// Icon sizes matching button sizes
const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-5 w-5",
};

export interface CTAButtonProps {
    children: React.ReactNode;
    href?: string;
    size?: keyof typeof sizeVariants;
    showArrow?: boolean;
    leftIcon?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function CTAButton({
    children,
    href = "/auth?mode=signup",
    size = "md",
    showArrow = true,
    leftIcon,
    className,
    onClick,
}: CTAButtonProps) {
    const buttonClasses = cn(
        "inline-flex items-center justify-center gap-2 rounded-full",
        "bg-gradient-primary",
        "text-white font-semibold",
        "shadow-lg shadow-primary/25",
        "hover-glow",
        "group",
        sizeVariants[size],
        className
    );

    const content = (
        <>
            {leftIcon && (
                <span className="hover-icon-spin">{leftIcon}</span>
            )}
            {children}
            {showArrow && (
                <ArrowRight className={cn(iconSizes[size], "hover-icon-arrow")} />
            )}
        </>
    );

    // If onClick is provided without href, render as button
    if (onClick && !href) {
        return (
            <button type="button" className={buttonClasses} onClick={onClick}>
                {content}
            </button>
        );
    }

    return (
        <Link href={href} className={buttonClasses}>
            {content}
        </Link>
    );
}
