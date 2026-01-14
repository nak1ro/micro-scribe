"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { Card, IconWrapper, Button, Input, Alert } from "@/components/ui";

interface ConfirmEmailErrorProps {
    errorMessage: string;
    email: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onResend: (e: React.FormEvent) => void;
    resendLoading: boolean;
    resendSuccess: boolean;
}

export function ConfirmEmailError({
    errorMessage,
    email,
    onEmailChange,
    onResend,
    resendLoading,
    resendSuccess,
}: ConfirmEmailErrorProps) {
    return (
        <Card className="w-full max-w-md p-8 shadow-xl flex flex-col items-center text-center space-y-4">
            <IconWrapper size="lg" variant="destructive">
                <WarningCircle className="w-10 h-10" weight="fill" />
            </IconWrapper>

            <h1 className="text-2xl font-semibold text-foreground">
                Verification failed
            </h1>
            <p className="text-muted-foreground">{errorMessage}</p>

            {/* Resend Form */}
            {!resendSuccess ? (
                <form onSubmit={onResend} aria-label="Resend verification email" className="w-full mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Enter your email to receive a new verification link:
                    </p>
                    <Input
                        type="email"
                        value={email}
                        onChange={onEmailChange}
                        placeholder="your@email.com"
                        required
                    />
                    <Button
                        type="submit"
                        disabled={resendLoading}
                        className="w-full"
                    >
                        {resendLoading ? "Sending..." : "Request new link"}
                    </Button>
                </form>
            ) : (
                <Alert variant="success" className="mt-4 w-full">
                    If an account exists with that email, a new verification link has been sent.
                </Alert>
            )}
        </Card>
    );
}
