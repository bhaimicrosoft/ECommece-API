'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))

  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#16161f', color: '#f1f1f3', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#16161f' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#16161f' } },
        }}
      />
    </QueryClientProvider>
  )
}
