"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
        "transition-all duration-[var(--transition-fast)] ease-[var(--easing-soft)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.97]",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                default: [
                    "bg-primary text-primary-foreground",
                    "hover:-translate-y-px hover:shadow-sm hover:bg-primary/90",
                ],
                secondary: [
                    "bg-secondary text-secondary-foreground",
                    "hover:-translate-y-px hover:shadow-sm hover:bg-secondary/80",
                ],
                destructive: [
                    "bg-destructive text-destructive-foreground",
                    "hover:-translate-y-px hover:shadow-sm hover:bg-destructive/90",
                ],
                outline: [
                    "border border-input bg-background",
                    "hover:bg-accent hover:text-accent-foreground hover:-translate-y-px hover:shadow-sm",
                ],
                ghost: [
                    "hover:bg-accent hover:text-accent-foreground",
                ],
                link: [
                    "text-primary underline-offset-4 hover:underline",
                ],
            },
            size: {
                sm: "h-8 px-3 text-xs",
                md: "h-10 px-4 py-2",
                lg: "h-12 px-6 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Spinner size="sm" className="mr-1" />
                        {children}
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
