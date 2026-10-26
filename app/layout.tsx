import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

// `next dev` tabs get a light-grey favicon so local and production are easy
// to tell apart; production uses public/favicon.ico.
const isLocal = process.env.NODE_ENV === 'development';

export const metadata: Metadata = {
  title: {
    default: 'DSA Answers',
    template: '%s',
  },
  icons: { icon: isLocal ? '/favicon-local.svg' : '/favicon.ico' },
  description: 'All DSA problems with brute force and optimal solutions — scroll, search, learn.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
