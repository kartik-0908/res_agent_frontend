// app/layout.tsx
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.makaicare.com'),
  title: 'MakaiCardio',
  description: 'Makai Cardio is powered by deep research',
};

const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' });

const THEME_COLOR_SCRIPT = `(/*…same as before…*/)`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const ua = headersList.get('user-agent')
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua as string);

  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {isMobile ? (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
                <p className="text-center text-base leading-relaxed mb-6 text-gray-800 dark:text-gray-100">
                  We’re working on our mobile UI.<br />
                  Soon we’ll be in the App Store & Play Store too.<br />
                  For the full experience, please use a laptop or PC.<br />
                  Thank you!
                </p>
               
              </div>
            </div>
          ) : (
            <>
              <Toaster position="top-center" />
              <SessionProvider>{children}</SessionProvider>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
