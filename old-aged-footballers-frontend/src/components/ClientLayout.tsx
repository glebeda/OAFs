'use client';

import { ReactNode } from 'react';
import { Providers } from './Providers';
import Navigation from './Navigation';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Navigation />
      <main>
        {children}
      </main>
    </Providers>
  );
} 