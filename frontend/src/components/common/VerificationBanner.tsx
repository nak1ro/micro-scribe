"use client";

import { useState, useEffect } from "react";
import { X, WarningCircle, EnvelopeSimple } from "@phosphor-icons/react";
import { useEmailVerification } from "@/context/VerificationContext";

export function VerificationBanner() {
    const { isVerified, resendEmail, resendLoading, resendSuccess, openModal } = useEmailVerification();
    const [dismissed, setDismissed] = useState(false);

    // Check localStorage for dismissed state
    useEffect(() => {
        const wasDismissed = localStorage.getItem("verification-banner-dismissed");
        if (wasDismissed) setDismissed(true);
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem("verification-banner-dismissed", "true");
    };

    const handleResend = async () => {
        await resendEmail();
    };

    // Don't show if verified or dismissed
    if (isVerified || dismissed) return null;

    return (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 animate-fade-in">
            <div className="flex items-start gap-3">
                <WarningCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                        Email not verified
                    </p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                        Some features are restricted until you verify your email.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        {resendSuccess ? (
                            <span className="text-xs text-green-600 dark:text-green-400">
                                ✓ Email sent! Check your inbox.
                            </span>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded transition-colors disabled:opacity-50"
                            >
                                <EnvelopeSimple className="w-3.5 h-3.5" />
                                {resendLoading ? "Sending..." : "Resend email"}
                            </button>
                        )}
                        <button
                            onClick={openModal}
                            className="text-xs text-amber-600/70 dark:text-amber-400/60 hover:underline"
                        >
                            Learn more
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 text-amber-500/60 hover:text-amber-500 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
