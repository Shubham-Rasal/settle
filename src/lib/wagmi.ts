import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  sepolia,
  polygonAmoy,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  avalancheFuji,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Settle',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '308576a0e081b280b26e1d3cd435f10b',
  chains: [
    sepolia,
    polygonAmoy,
    arbitrumSepolia,
    optimismSepolia,
    baseSepolia,
    avalancheFuji,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});