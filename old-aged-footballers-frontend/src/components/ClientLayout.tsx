'use client';

import { ReactNode } from 'react';
import { Providers } from './Providers';
import Navigation from './Navigation';
import { Toaster } from 'react-hot-toast';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Navigation />
      <main>
        {children}
      </main>
      <Toaster position="top-right" />
    </Providers>
  );
} 