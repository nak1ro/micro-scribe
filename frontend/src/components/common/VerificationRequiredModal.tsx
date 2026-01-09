"use client";

import { useEffect, useRef } from "react";
import { X, ShieldWarning, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";
import { useEmailVerification } from "@/context/VerificationContext";

export function VerificationRequiredModal() {
    const { isModalOpen, closeModal, resendEmail, resendLoading, resendSuccess } = useEmailVerification();
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        if (isModalOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isModalOpen, closeModal]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            closeModal();
        }
    };

    if (!isModalOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-scale-in"
            >
                {/* Close button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <ShieldWarning className="w-8 h-8 text-amber-500" weight="fill" />
                    </div>

                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Email verification required
                    </h2>

                    <p className="text-muted-foreground text-sm mb-6">
                        Please verify your email address to access this feature.
                        Check your inbox for the verification link.
                    </p>

                    {resendSuccess ? (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                                Verification email sent! Check your inbox.
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={resendEmail}
                                disabled={resendLoading}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <EnvelopeSimple className="w-5 h-5" />
                                {resendLoading ? "Sending..." : "Resend verification email"}
                            </button>
                            <button
                                onClick={closeModal}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                I&apos;ll do this later
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
