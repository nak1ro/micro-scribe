"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface FormFieldProps {
    id: string;
    label: string;
    type?: "text" | "email" | "password";
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    autoComplete?: string;
    /** Optional content to render in the label row (e.g., "Forgot password?" link) */
    labelExtra?: React.ReactNode;
}

export function FormField({
    id,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    autoComplete,
    labelExtra,
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={id}>{label}</Label>
                {labelExtra}
            </div>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                hasError={!!error}
                autoComplete={autoComplete}
            />
            {error && (
                <p className="text-xs text-destructive animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
}
