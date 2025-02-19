import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OAFs',
  description: 'Track and manage football games for the Old Age Footballers community',
  icons: {
    icon: '/favicon-32x32.png',
  },
  openGraph: {
    title: 'OAFs',
    description: 'Track and manage football games for the Old Age Footballers community',
    url: 'https://oaf.playfootie.net/',
    siteName: 'OAFs',
    images: [
      {
        url: '/logo192.png',
        width: 192,
        height: 192,
        alt: 'OAFs Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'OAFs',
    description: 'Track and manage football games for the Old Age Footballers community',
    images: ['/logo192.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}