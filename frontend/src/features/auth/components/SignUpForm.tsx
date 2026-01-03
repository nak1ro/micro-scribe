"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { FormField } from "./FormField";

interface SignUpFormData {
    email: string;
    password: string;
}

interface SignUpFormProps {
    onSubmit?: (data: SignUpFormData) => Promise<void>;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [acceptTerms, setAcceptTerms] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        terms?: string;
    }>({});

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!acceptTerms) {
            newErrors.terms = "You must accept the terms";
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
                id="signup-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                error={errors.email}
                autoComplete="email"
            />

            <FormField
                id="signup-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                error={errors.password}
                autoComplete="new-password"
            />

            <FormField
                id="signup-confirm"
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={errors.confirmPassword}
                autoComplete="new-password"
            />

            {/* Terms checkbox */}
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    id="signup-terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className={cn(
                        "mt-0.5 h-4 w-4 rounded border-input",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "accent-primary"
                    )}
                />
                <div>
                    <label
                        htmlFor="signup-terms"
                        className="text-sm text-muted-foreground cursor-pointer"
                    >
                        I agree to the{" "}
                        <a
                            href="/terms"
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="/privacy"
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                    </label>
                    {errors.terms && (
                        <p className="text-xs text-destructive animate-fade-in mt-1">
                            {errors.terms}
                        </p>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Create account
            </Button>
        </form>
    );
}
