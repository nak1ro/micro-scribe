"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { WarningCircle, EnvelopeSimple } from "@phosphor-icons/react";
import { useEmailVerification } from "@/context/VerificationContext";

const BANNER_HEIGHT = 52;

export function VerificationBanner() {
    const { isVerified, isLoading, resendEmail, resendLoading, resendSuccess } = useEmailVerification();
    const pathname = usePathname();

    // Hide on transcription viewer page
    const isTranscriptionView = pathname?.includes("/transcriptions/");

    // Only show banner when loading is done AND user is definitely unverified
    const isVisible = !isLoading && !isVerified && !isTranscriptionView;

    // Update CSS variable for layout offset
    useEffect(() => {
        const height = isVisible ? `${BANNER_HEIGHT}px` : "0px";
        document.documentElement.style.setProperty("--banner-height", height);
        return () => {
            document.documentElement.style.setProperty("--banner-height", "0px");
        };
    }, [isVisible]);

    const handleResend = async () => {
        await resendEmail();
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 w-full border-b"
            style={{
                height: BANNER_HEIGHT,
                backgroundColor: "var(--banner-bg)",
                borderColor: "var(--banner-border)"
            }}
        >
            <style>{`
                :root { --banner-bg: #FFF9E6; --banner-border: #E6D9A6; }
                .dark { --banner-bg: #2D2A1F; --banner-border: #3D3520; }
            `}</style>
            <div className="px-6 py-3 flex items-center justify-between gap-4 h-full">
                {/* Left: Icon and message */}
                <div className="flex items-center gap-3 min-w-0">
                    <WarningCircle className="w-5 h-5 text-amber-500 flex-shrink-0" weight="fill" />
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-foreground font-medium">
                            Email not verified
                        </span>
                        <span className="hidden sm:inline text-sm text-muted-foreground">
                            — Some features are restricted until you verify your email.
                        </span>
                    </div>
                </div>

                {/* Right: Resend action */}
                <div className="flex items-center flex-shrink-0">
                    {resendSuccess ? (
                        <span className="text-sm text-green-600 dark:text-green-400">
                            ✓ Email sent!
                        </span>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-amber-500/20 hover:bg-amber-500/30 rounded-md transition-colors disabled:opacity-50"
                        >
                            <EnvelopeSimple className="w-4 h-4" />
                            <span className="hidden sm:inline">{resendLoading ? "Sending..." : "Resend email"}</span>
                            <span className="sm:hidden">{resendLoading ? "..." : "Resend"}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

