"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

// Extend Window interface to include ethereum
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

const CHAINS = [
  { label: "Ethereum", value: "ethereum", chainId: "0x1" },
  { label: "Polygon", value: "polygon", chainId: "0x89" },
  { label: "Arbitrum", value: "arbitrum", chainId: "0xa4b1" },
  { label: "Optimism", value: "optimism", chainId: "0xa" },
  { label: "Base", value: "base", chainId: "0x2105" },
  { label: "Avalanche", value: "avalanche", chainId: "0xa86a" },
  { label: "Solana", value: "solana", chainId: null }, // Solana doesn't use EVM chain IDs
];

interface CheckoutData {
  id: string;
  title: string;
  amount: string;
  recipientWallets: Record<string, string>;
  supportedChains: string[];
}

export default function PublicCheckoutPage() {
  const { slug } = useParams();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        const slugParam = typeof slug === "string" ? slug : Array.isArray(slug) ? slug[0] : "";
        const response = await fetch(`/api/checkouts/${slugParam}`);
        
        if (!response.ok) {
          throw new Error('Checkout not found');
        }
        
        const data = await response.json();
        setCheckout(data.checkout);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckout();
  }, [slug]);

  const connectWallet = async () => {
    setConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
          toast.success('Wallet connected successfully!');
        }
      } else {
        toast.error('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const switchNetwork = async (chainId: string) => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask to switch networks');
        return false;
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      return true;
    } catch (error: any) {
      console.error('Error switching network:', error);
      toast.error(`Failed to switch to network. Please switch manually.`);
      return false;
    }
  };

  const handlePay = async () => {
    if (!checkout || !selectedChain || !walletConnected) {
      toast.error('Please select a chain and connect your wallet');
      return;
    }

    setIsPaying(true);
    
    try {
      const selectedChainData = CHAINS.find(c => c.value === selectedChain);
      
      // For Solana, we'd need different handling
      if (selectedChain === 'solana') {
        toast.error('Solana payments not yet supported');
        setIsPaying(false);
        return;
      }

      // Switch to the selected network if needed
      if (selectedChainData?.chainId) {
        const switched = await switchNetwork(selectedChainData.chainId);
        if (!switched) {
          setIsPaying(false);
          return;
        }
      }

      // Mock payment logic - in a real app, this would interact with USDC contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      setTxHash(mockTxHash);
      setPaid(true);
      toast.success('Payment successful!');
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openTxOnExplorer = (hash: string) => {
    // This would need to be chain-specific in a real app
    const explorerUrl = `https://etherscan.io/tx/${hash}`;
    window.open(explorerUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center">Loading checkout...</div>
        </Card>
      </div>
    );
  }

  if (error || !checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center space-y-4">
            <div className="text-red-600">
              {error || 'Checkout not found'}
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground">Thank you for your payment of {checkout.amount} USDC</p>
            </div>
            
            {txHash && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Transaction Hash</Label>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs bg-muted p-2 rounded flex-1 truncate">
                    {txHash}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(txHash)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openTxOnExplorer(txHash)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const availableChains = CHAINS.filter(chain => 
    checkout.supportedChains.includes(chain.value)
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{checkout.title}</h1>
          <p className="text-muted-foreground">Pay with USDC</p>
        </div>
        
        <Separator className="mb-6" />
        
        <div className="mb-6 space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Amount</span>
            <span className="font-mono text-lg">{checkout.amount} USDC</span>
          </div>
          
          {selectedChain && (
            <div className="flex justify-between">
              <span className="font-medium">Recipient</span>
              <span className="font-mono text-xs truncate max-w-[180px]">
                {checkout.recipientWallets[selectedChain]}
              </span>
            </div>
          )}
        </div>

        {!walletConnected ? (
          <div className="space-y-4">
            <Button 
              className="w-full" 
              onClick={connectWallet}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect Wallet to Pay'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Connect your wallet to proceed with payment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Wallet Connected</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chain">Choose Payment Chain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain} required>
                <SelectTrigger id="chain">
                  <SelectValue placeholder="Select a blockchain" />
                </SelectTrigger>
                <SelectContent>
                  {availableChains.map(chain => (
                    <SelectItem key={chain.value} value={chain.value}>
                      {chain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPaying || !selectedChain}
              onClick={handlePay}
            >
              {isPaying ? 'Processing Payment...' : `Pay ${checkout.amount} USDC`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You will be prompted to approve the transaction in your wallet
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Powered by</p>
            <Link href="/" className="text-primary font-semibold hover:underline">
              Settle
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}