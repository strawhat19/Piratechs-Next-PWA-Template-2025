import './globals.scss';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: `Next PWA`,
  description: `Next PWA w/ Typescript & Sass`,
  themeColor: `#000000`,
  manifest: `/manifest.json`,
  icons: {
    icon: `/icon-192x192.png`,
    apple: `/icon-192x192.png`,
    shortcut: `/icon-512x512.png`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={`en`}>
      <body className={`nextPWABody ${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}