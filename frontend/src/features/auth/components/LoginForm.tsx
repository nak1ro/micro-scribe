"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { FormField } from "./FormField";

interface LoginFormProps {
    onSubmit?: (data: { email: string; password: string }) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email address";
        }
        if (!password) {
            newErrors.password = "Password is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            await onSubmit?.({ email, password });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
                id="login-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                error={errors.email}
                autoComplete="email"
            />

            <FormField
                id="login-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                error={errors.password}
                autoComplete="current-password"
                labelExtra={
                    <Link
                        href="/auth/forgot-password"
                        className={cn(
                            "text-xs text-muted-foreground",
                            "hover:text-foreground transition-colors duration-[var(--transition-fast)]"
                        )}
                    >
                        Forgot password?
                    </Link>
                }
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Log in
            </Button>
        </form>
    );
}
