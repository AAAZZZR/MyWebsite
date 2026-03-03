import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Digital Solutions & AI Automation | LEVEUP',
    description: 'Expert Web Development, Cloud Management, and Enterprise AI Automation workflows using n8n.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-950 text-slate-200`}>
                <AnimatedBackground />

                <div className="relative z-50 flex flex-col min-h-screen">
                    <Navbar />

                    <main className="flex-grow pt-24">
                        {children}
                    </main>

                    <ChatWidget />
                </div>
            </body>
        </html>
    );
}
