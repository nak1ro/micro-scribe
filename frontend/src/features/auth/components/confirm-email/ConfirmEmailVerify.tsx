"use client";

import { Card, Spinner } from "@/components/ui";

export function ConfirmEmailVerify() {
    return (
        <Card className="w-full max-w-md p-8 shadow-xl flex flex-col items-center text-center space-y-4">
            <Spinner size="lg" className="text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">
                Verifying your email...
            </h1>
            <p className="text-muted-foreground">
                Please wait while we confirm your email address.
            </p>
        </Card>
    );
}
