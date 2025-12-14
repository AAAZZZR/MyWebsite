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
      {/* 修正 1: bg-slate-50 改為 bg-slate-950 (深色底)，文字改淺色 */}
      <body className={`${inter.className} bg-slate-950 text-slate-200`}>
        
        {/* 背景層 */}
        <AnimatedBackground />

        {/* 內容層：包含 Navbar, Main, Footer */}
        <div className="relative z-50 flex flex-col min-h-screen">
          
          <Navbar />
          
          <main className="flex-grow pt-24">
            {children}
          </main>
          
          
          <footer className="py-8 text-center text-sm text-slate-500  bg-slate-950/30 backdrop-blur-sm mt-20">
            © {new Date().getFullYear()} LEVEUP. All rights reserved.
          </footer>
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}