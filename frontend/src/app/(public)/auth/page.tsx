import { Suspense } from "react";
import { PublicLayout } from "@/components/layout";
import { AuthCard } from "@/features/auth";

export default function AuthPage() {
    return (
        <PublicLayout>
            <div className="flex min-h-[calc(100vh-4rem-200px)] items-center justify-center px-4 py-12">
                <Suspense
                    fallback={
                        <div className="w-full max-w-md h-[500px] bg-card border border-border rounded-2xl animate-pulse" />
                    }
                >
                    <AuthCard />
                </Suspense>
            </div>
        </PublicLayout>
    );
}
