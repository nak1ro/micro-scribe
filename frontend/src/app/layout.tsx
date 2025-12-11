import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'ScribeApi - Transcription Service',
    description: 'AI-powered audio/video transcription',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
