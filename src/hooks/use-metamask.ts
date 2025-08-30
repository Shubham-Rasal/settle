"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface MetaMaskWallet {
  address: string;
  chainId: string;
  chainName: string;
  isConnected: boolean;
}

interface UseMetaMaskReturn {
  isMetaMaskInstalled: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  chainName: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: string) => Promise<void>;
  addChain: (chainConfig: any) => Promise<void>;
}

// Chain configurations for supported networks
const CHAIN_CONFIGS: Record<string, any> = {
  "0xaa36a7": {
    chainId: "0xaa36a7",
    chainName: "Ethereum Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  "0x66eee": {
    chainId: "0x66eee",
    chainName: "Arbitrum Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  },
  "0x14a34": {
    chainId: "0x14a34",
    chainName: "Base Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
  "0xa869": {
    chainId: "0xa869",
    chainName: "Avalanche Fuji",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://testnet.snowtrace.io"],
  },
  "0x13882": {
    chainId: "0x13882",
    chainName: "Polygon Amoy",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
  },
  "0xaa37dc": {
    chainId: "0xaa37dc",
    chainName: "Optimism Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.optimism.io"],
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
  },
};

const CHAIN_ID_TO_NAME: Record<string, string> = {
  "0xaa36a7": "Ethereum Sepolia",
  "0x66eee": "Arbitrum Sepolia", 
  "0x14a34": "Base Sepolia",
  "0xa869": "Avalanche Fuji",
  "0x13882": "Polygon Amoy",
  "0xaa37dc": "Optimism Sepolia",
};

export function useMetaMask(): UseMetaMaskReturn {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [chainName, setChainName] = useState<string | null>(null);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== "undefined" && window.ethereum?.isMetaMask) {
        setIsMetaMaskInstalled(true);
        
        // Check if already connected
        window.ethereum.request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              setIsConnected(true);
              
              // Get current chain
              return window.ethereum?.request({ method: "eth_chainId" });
            }
          })
          .then((currentChainId: string) => {
            if (currentChainId) {
              setChainId(currentChainId);
              setChainName(CHAIN_ID_TO_NAME[currentChainId] || "Unknown Network");
            }
          })
          .catch(console.error);
      }
    };

    checkMetaMask();
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccount(null);
        setChainId(null);
        setChainName(null);
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
      setChainName(CHAIN_ID_TO_NAME[newChainId] || "Unknown Network");
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      toast.error("MetaMask is not installed. Please install MetaMask to continue.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum?.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get current chain
        const currentChainId = await window.ethereum?.request({
          method: "eth_chainId",
        });
        setChainId(currentChainId);
        setChainName(CHAIN_ID_TO_NAME[currentChainId] || "Unknown Network");
        
        toast.success("MetaMask wallet connected successfully!");
      }
    } catch (error: any) {
      console.error("Failed to connect MetaMask:", error);
      if (error.code === 4001) {
        toast.error("Connection request was rejected by user.");
      } else {
        toast.error("Failed to connect to MetaMask. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setChainName(null);
    toast.success("Wallet disconnected");
  }, []);

  const switchChain = useCallback(async (targetChainId: string) => {
    if (!window.ethereum || !isConnected) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
    } catch (error: any) {
      // If chain is not added to MetaMask, add it
      if (error.code === 4902) {
        const chainConfig = CHAIN_CONFIGS[targetChainId];
        if (chainConfig) {
          await addChain(chainConfig);
        }
      } else {
        console.error("Failed to switch chain:", error);
        toast.error("Failed to switch network. Please try again.");
      }
    }
  }, [isConnected]);

  const addChain = useCallback(async (chainConfig: any) => {
    if (!window.ethereum || !isConnected) return;

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [chainConfig],
      });
      toast.success(`${chainConfig.chainName} network added successfully!`);
    } catch (error: any) {
      console.error("Failed to add chain:", error);
      toast.error("Failed to add network. Please try again.");
    }
  }, [isConnected]);

  return {
    isMetaMaskInstalled,
    isConnecting,
    isConnected,
    account,
    chainId,
    chainName,
    connectWallet,
    disconnectWallet,
    switchChain,
    addChain,
  };
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}