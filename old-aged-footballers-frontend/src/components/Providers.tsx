'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster 
        position="top-right"
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          duration: 3000,
          className: 'w-[calc(100vw-40px)] sm:w-[350px]',
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
          },
        }}
      />
      {children}
    </QueryClientProvider>
  );
} 