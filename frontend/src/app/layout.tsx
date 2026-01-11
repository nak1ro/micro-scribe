import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/context/QueryProvider';
import { VerificationProvider } from '@/context/VerificationContext';
import { VerificationRequiredModal } from '@/components/common/VerificationRequiredModal';

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans',
});

export const metadata: Metadata = {
    title: 'ScribeRocket - AI Transcription',
    description: 'Transcribe audio in minutes, not hours. AI-powered transcription with timestamps, summaries, and translations.',
    icons: {
        icon: '/icon.svg',
        shortcut: '/icon.svg',
        apple: '/icon.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={plusJakartaSans.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <QueryProvider>
                            <VerificationProvider>
                                {children}
                                <VerificationRequiredModal />
                            </VerificationProvider>
                        </QueryProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

