import './globals.scss';

import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import GlobalProvider from '@/shared/global-context';
import { constants } from '@/shared/scripts/constants';

export const dynamicParams = true;

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plusJakartaSans',
});

export const viewport: Viewport = { themeColor: `#000000` };
export const metadata: Metadata = {
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
    <html lang={`en`} className={`appContainer ${plusJakartaSans?.variable}`}>
      <GlobalProvider>
        {children}
      </GlobalProvider>
    </html>
  );
}