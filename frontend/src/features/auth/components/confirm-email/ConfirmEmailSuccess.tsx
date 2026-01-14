"use client";

import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Card, IconWrapper, Button } from "@/components/ui";

interface ConfirmEmailSuccessProps {
    isLoggedIn: boolean;
}

export function ConfirmEmailSuccess({ isLoggedIn }: ConfirmEmailSuccessProps) {
    const router = useRouter();

    return (
        <Card className="w-full max-w-md p-8 shadow-xl flex flex-col items-center text-center space-y-4">
            <IconWrapper size="lg" variant="success">
                <CheckCircle className="w-10 h-10" weight="fill" />
            </IconWrapper>

            <h1 className="text-2xl font-semibold text-foreground">
                Email verified!
            </h1>
            <p className="text-muted-foreground">
                {isLoggedIn
                    ? "Redirecting to dashboard..."
                    : "Your email has been confirmed. You can now log in."}
            </p>
            {!isLoggedIn && (
                <Button
                    onClick={() => router.push("/auth")}
                    className="mt-4 gap-2"
                >
                    Go to Login
                    <ArrowRight className="w-4 h-4" />
                </Button>
            )}
        </Card>
    );
}
