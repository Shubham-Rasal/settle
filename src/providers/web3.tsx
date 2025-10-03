'use client'

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, base, optimism, sepolia, polygonAmoy, arbitrumSepolia, optimismSepolia, baseSepolia, avalancheFuji } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet, base, optimism, sepolia, polygonAmoy, arbitrumSepolia, optimismSepolia, baseSepolia, avalancheFuji],

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: "Settle",

    // Optional App Info
    appDescription: "Settle",
    appUrl: "https://settle.com", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};