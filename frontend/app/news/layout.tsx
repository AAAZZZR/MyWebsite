import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
    title: 'News - LEVEUP',
    description: 'Live news from around the world',
};

export default function NewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
