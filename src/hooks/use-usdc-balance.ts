import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { Blockchain } from '@/lib/types';
import { CHAIN_CONFIG } from '@/lib/chain-config';
import { 
  mainnet, 
  polygon, 
  arbitrum, 
  base, 
  avalanche, 
  optimism, 
  linea,
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  lineaTestnet,
} from 'viem/chains';

const DEFAULT_DECIMALS = 6; // USDC has 6 decimals

const getChainConfig = (blockchain: Blockchain) => {
  const config = CHAIN_CONFIG[blockchain];
  if (!config) {
    throw new Error(`No configuration found for blockchain: ${blockchain}`);
  }

  // For non-EVM chains like Solana
  if (blockchain === Blockchain.SOL || blockchain === Blockchain.SOL_DEVNET) {
    return null;
  }

  // Get the corresponding viem chain config
  let baseChain;
  switch (blockchain) {
    case Blockchain.ETH:
      baseChain = mainnet;
      break;
    case Blockchain.MATIC:
      baseChain = polygon;
      break;
    case Blockchain.ARB:
      baseChain = arbitrum;
      break;
    case Blockchain.BASE:
      baseChain = base;
      break;
    case Blockchain.AVAX:
      baseChain = avalanche;
      break;
    case Blockchain.OP:
      baseChain = optimism;
      break;
    case Blockchain.LINEA:
      baseChain = linea;
      break;
    case Blockchain.ETH_SEPOLIA:
      baseChain = sepolia;
      break;
    case Blockchain.ARB_SEPOLIA:
      baseChain = arbitrumSepolia;
      break;
    case Blockchain.BASE_SEPOLIA:
      baseChain = baseSepolia;
      break;
    case Blockchain.OP_SEPOLIA:
      baseChain = optimismSepolia;
      break;
    case Blockchain.LINEA_SEPOLIA:
      baseChain = lineaTestnet;
      break;
    case Blockchain.AVAX_FUJI:
      baseChain = {
        ...avalanche,
        id: 43113,
        name: 'Avalanche Fuji',
        rpcUrls: {
          default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] }
        }
      };
      break;
    case Blockchain.MATIC_AMOY:
      baseChain = {
        ...polygon,
        id: 80002,
        name: 'Polygon Amoy',
        rpcUrls: {
          default: { http: ['https://rpc-amoy.polygon.technology'] }
        }
      };
      break;
    default:
      throw new Error(`Unsupported blockchain: ${blockchain}`);
  }

  return {
    ...baseChain,
    ...config,
  };
};

export function useUSDCBalance(address: string, blockchain: Blockchain) {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPublicClientForChain = (blockchain: Blockchain) => {
    const chain = getChainConfig(blockchain);
    if (!chain) {
      throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
    
    return createPublicClient({
      chain,
      transport: http(),
    });
  };

  const fetchBalance = async () => {
    if (!address || !blockchain) return;

    setIsLoading(true);
    setError(null);

    try {
      const publicClientForChain = getPublicClientForChain(blockchain);
      const config = CHAIN_CONFIG[blockchain];

      if (!config) {
        throw new Error(`No configuration found for blockchain: ${blockchain}`);
      }

      // Special handling for Solana
      if (blockchain === Blockchain.SOL) {
        // TODO: Implement Solana balance fetching
        setBalance('0');
        return;
      }

      const erc20ABI = [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
          stateMutability: "view"
        },
        {
          constant: true,
          inputs: [],
          name: "decimals",
          outputs: [{ name: "", type: "uint8" }],
          type: "function",
          stateMutability: "view"
        }
      ] as const;

      // First try to get decimals, fallback to default if it fails
      let decimals = DEFAULT_DECIMALS;
      try {
        const tokenDecimals = await publicClientForChain.readContract({
          address: config.usdcAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "decimals",
        });
        decimals = Number(tokenDecimals);
      } catch (err) {
        console.warn("Failed to get token decimals, using default:", DEFAULT_DECIMALS);
      }

      const rawBalance = await publicClientForChain.readContract({
        address: config.usdcAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });

      const formattedBalance = formatUnits(rawBalance as bigint, decimals);
      console.log('Formatted balance:', formattedBalance)
      setBalance(formattedBalance);
    } catch (err) {
      console.error("Error fetching USDC balance:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address, blockchain]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

