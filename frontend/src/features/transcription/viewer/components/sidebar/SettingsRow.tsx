"use client";

import * as React from "react";

interface SettingsRowProps {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}

export function SettingsRow({ icon, label, children }: SettingsRowProps) {
    return (
        <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm text-foreground">{label}</span>
            </div>
            {children}
        </div>
    );
}
