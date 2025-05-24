import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { NotesProvider } from '@/context/NotesProvider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Duboko',
  description: 'Productivity environment',
  openGraph: {
    title: 'Duboko',
    description: 'Productivity environment',
    images: [
      {
        url: '/welcome.png',
        width: 1200,
        height: 630,
        alt: 'Duboko',
      },
    ],
    type: 'website',
    url: 'https://www.duboko.site',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <NotesProvider>
        <html lang="en" className={inter.variable}>
          <head>
            <link rel="icon" href="/icon.png" sizes="any" />
          </head>
          <body>{children}</body>
        </html>
      </NotesProvider>
    </ClerkProvider>
  );
}
