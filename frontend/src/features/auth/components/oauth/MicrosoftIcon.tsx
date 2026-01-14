"use client";

interface MicrosoftIconProps {
    className?: string;
}

export function MicrosoftIcon({ className }: MicrosoftIconProps) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M1 1h10.5v10.5H1V1z" fill="#F25022" />
            <path d="M12.5 1H23v10.5H12.5V1z" fill="#7FBA00" />
            <path d="M1 12.5h10.5V23H1V12.5z" fill="#00A4EF" />
            <path d="M12.5 12.5H23V23H12.5V12.5z" fill="#FFB900" />
        </svg>
    );
}
