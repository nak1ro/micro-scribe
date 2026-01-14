"use client";

import * as React from "react";
import { Input, Label } from "@/components/ui";
import { FieldError } from "react-hook-form";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    error?: string | FieldError;
    /** Optional content to render in the label row (e.g., "Forgot password?" link) */
    labelExtra?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    ({ id, label, error, labelExtra, className, ...props }, ref) => {
        const errorMessage = typeof error === "string" ? error : error?.message;

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={id}>{label}</Label>
                    {labelExtra}
                </div>
                <Input
                    id={id}
                    ref={ref}
                    hasError={!!errorMessage}
                    className={className}
                    {...props}
                />
                {errorMessage && (
                    <p className="text-xs text-destructive animate-fade-in">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }
);
FormField.displayName = "FormField";
