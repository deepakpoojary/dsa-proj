import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import SessionGate from '@/components/SessionGate';

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
  icons: { icon: isLocal ? '/favicon-local.svg' : '/favicon.ico', apple: '/apple-touch-icon.png' },
  // iPhone "Add to Home Screen": open full screen with this name.
  appleWebApp: { capable: true, title: 'DSA', statusBarStyle: 'black-translucent' },
  description: 'All DSA problems with brute force and optimal solutions — scroll, search, learn.',
};

export const viewport: Viewport = {
  themeColor: '#0d1117',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <SessionGate />
      </body>
    </html>
  );
}
