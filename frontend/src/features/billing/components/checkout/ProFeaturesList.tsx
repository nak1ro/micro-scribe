"use client";

import { Sparks, CheckCircle } from "iconoir-react";
import { Card } from "@/components/ui";
import { planCardContent } from "@/features/marketing/pricing/data";

// Displays the list of Pro plan features
export function ProFeaturesList() {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Sparks className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Pro Plan includes</h2>
            </div>
            <div className="space-y-3">
                {planCardContent.pro.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        <span className="text-sm">{feature.text}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
