"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { FormField } from "./FormField";
import { loginSchema, LoginSchema } from "../schemas";

interface LoginFormProps {
    onSubmit?: (data: LoginSchema) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const submitHandler = async (data: LoginSchema) => {
        setIsLoading(true);
        try {
            await onSubmit?.(data);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            <FormField
                id="login-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email}
                {...register("email")}
            />

            <FormField
                id="login-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password}
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
                {...register("password")}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Log in
            </Button>
        </form>
    );
}
