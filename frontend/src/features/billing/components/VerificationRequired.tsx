"use client";

import { WarningCircle, Mail } from "iconoir-react";
import { Button, Alert, IconWrapper } from "@/components/ui";

interface VerificationRequiredProps {
    onResendEmail: () => void;
    resendLoading: boolean;
    resendSuccess: boolean;
}

// Displayed when user hasn't verified their email before checkout
export function VerificationRequired({
    onResendEmail,
    resendLoading,
    resendSuccess,
}: VerificationRequiredProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-md mx-auto px-4 py-16 text-center">
                <IconWrapper size="lg" variant="warning" className="mx-auto mb-6">
                    <WarningCircle className="w-8 h-8" />
                </IconWrapper>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Email verification required
                </h1>
                <p className="text-muted-foreground mb-6">
                    Please verify your email address before subscribing to Pro.
                </p>
                {resendSuccess ? (
                    <Alert variant="success">
                        ✓ Verification email sent! Check your inbox.
                    </Alert>
                ) : (
                    <Button onClick={onResendEmail} disabled={resendLoading} className="gap-2">
                        <Mail className="w-4 h-4" />
                        {resendLoading ? "Sending..." : "Resend verification email"}
                    </Button>
                )}
                <div className="mt-6">
                    <a
                        href="/account/billing"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Back to billing
                    </a>
                </div>
            </div>
        </div>
    );
}
