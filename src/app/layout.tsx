import './globals.scss';

import type { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';

export const metadata: Metadata = {
  themeColor: `#000000`,
  manifest: `/manifest.json`,
  title: constants?.titles.default,
  description: constants?.titles.extended,
  icons: {
    icon: `/icon-192x192.png`,
    apple: `/icon-192x192.png`,
    shortcut: `/icon-512x512.png`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={`en`}>
      {children}
    </html>
  );
}