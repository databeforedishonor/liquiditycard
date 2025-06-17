"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { DAppKitProvider } from "@vechain/dapp-kit-react"
import type { WalletConnectOptions } from "@vechain/dapp-kit-react"
import { MAINNET_URL } from "@vechain/sdk-network"
import { useState } from "react"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance with default options
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time - how long data stays fresh
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache time - how long data stays in cache when not in use
            gcTime: 30 * 60 * 1000, // 30 minutes
            // Retry failed requests
            retry: 3,
            // Refetch on window focus
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // WalletConnect options for connecting external wallets
  const walletConnectOptions: WalletConnectOptions = {
    // Create your project here: https://cloud.walletconnect.com/sign-up
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
    metadata: {
      name: 'Liquidity Card - VeChain DeFi',
      description: 'Add and withdraw liquidity on VeChain',
      // Your app URL
      url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
      // Your app Icon - you can add your own icon later
      icons: [`${typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000'}/favicon.ico`],
    },
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DAppKitProvider
        // REQUIRED: The URL of the node you want to connect to
        node={MAINNET_URL}
        // OPTIONAL: Whether or not to persist state in local storage (account, wallet source)
        usePersistence={true}
        // OPTIONAL: Options to enable wallet connect
        walletConnectOptions={walletConnectOptions}
        // OPTIONAL: A log level for console logs
        logLevel="DEBUG"
        // OPTIONAL: theme mode 'LIGHT' or 'DARK'
        themeMode="LIGHT"
        // OPTIONAL: app current language
        language="en"
        // OPTIONAL: every wallet has a connection certificate, but wallet connect doesn't connect with a certificate, it uses a session; if required, with this option, we will force the user to sign a certificate after he finishes the connection with wallet connect
        requireCertificate={false}
        // OPTIONAL: you can choose which wallets to allow in your application between 'wallet-connect', 'veworld', 'sync2' or 'sync'. Default: all
        allowedWallets={['veworld', 'wallet-connect', 'sync2']}
      >
        {children}
      <ReactQueryDevtools />
      </DAppKitProvider>
    </QueryClientProvider>
  )
} 