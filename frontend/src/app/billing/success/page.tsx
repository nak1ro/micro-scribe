"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";

export default function BillingSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Stripe Customer Portal redirects here on "Return".
        // Use replace to avoid keeping this interstitial in history.
        router.replace("/account/billing");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-muted-foreground">Redirecting to billing settings...</p>
            </div>
        </div>
    );
}
