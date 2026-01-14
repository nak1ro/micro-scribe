"use client";

import { useParams } from "next/navigation";
import { OAuthCallback } from "@/features/auth/components/oauth";

export default function OAuthCallbackPage() {
    const params = useParams();
    const provider = params?.provider as string;

    return <OAuthCallback provider={provider} />;
}
