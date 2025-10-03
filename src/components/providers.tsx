// providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { Web3Provider } from '@/providers/web3'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic background refetching
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
   
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          {children}
        </Web3Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    
  )
} 