"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { FormField } from "./FormField";
import { registerSchema, RegisterSchema } from "../schemas";

interface RegisterFormProps {
    onSubmit?: (data: { email: string; password: string }) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
    });

    const submitHandler = async (data: RegisterSchema) => {
        setIsLoading(true);
        try {
            // Only send email and password to parent handler
            await onSubmit?.({ email: data.email, password: data.password });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            <FormField
                id="signup-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email}
                {...register("email")}
            />

            <FormField
                id="signup-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.password}
                {...register("password")}
            />

            <FormField
                id="signup-confirm"
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
            />

            {/* Terms checkbox */}
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    id="signup-terms"
                    className={cn(
                        "mt-0.5 h-4 w-4 rounded border-input",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "accent-primary"
                    )}
                    {...register("acceptTerms")}
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
                    {errors.acceptTerms && (
                        <p className="text-xs text-destructive animate-fade-in mt-1">
                            {errors.acceptTerms.message}
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
