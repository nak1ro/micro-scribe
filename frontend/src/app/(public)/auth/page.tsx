import { Suspense } from "react";
import { PublicLayout } from "@/components/layout";
import { AuthCard } from "@/features/auth";

export default function AuthPage() {
    return (
        <PublicLayout>
            <div className="relative flex min-h-[calc(100vh-4rem-200px)] items-center justify-center px-4 py-12 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Dot grid pattern */}
                    <div className="absolute inset-0 bg-dot-grid opacity-30" />

                    {/* Large ambient glows */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
                </div>

                <Suspense
                    fallback={
                        <div className="w-full max-w-md h-[600px] bg-card border border-border rounded-2xl animate-pulse" />
                    }
                >
                    <AuthCard />
                </Suspense>
            </div>
        </PublicLayout>
    );
}
