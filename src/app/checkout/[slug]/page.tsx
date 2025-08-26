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
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { 
  sepolia, 
  polygonAmoy, 
  arbitrumSepolia, 
  optimismSepolia, 
  baseSepolia, 
  avalancheFuji 
} from 'wagmi/chains';

const CHAINS = [
  { label: "Ethereum Sepolia", value: "ethereum", chainId: sepolia.id, chain: sepolia },
  { label: "Polygon Amoy", value: "polygon", chainId: polygonAmoy.id, chain: polygonAmoy },
  { label: "Arbitrum Sepolia", value: "arbitrum", chainId: arbitrumSepolia.id, chain: arbitrumSepolia },
  { label: "Optimism Sepolia", value: "optimism", chainId: optimismSepolia.id, chain: optimismSepolia },
  { label: "Base Sepolia", value: "base", chainId: baseSepolia.id, chain: baseSepolia },
  { label: "Avalanche Fuji", value: "avalanche", chainId: avalancheFuji.id, chain: avalancheFuji },
];

interface CheckoutData {
  id: string;
  title: string;
  amount: string;
  recipientWallets: Record<string, string>;
  supportedChains: string[];
}

// USDC contract addresses on different testnet chains (from Circle config)
const USDC_ADDRESSES: Record<string, `0x${string}`> = {
  ethereum: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Ethereum Sepolia
  polygon: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Polygon Amoy
  arbitrum: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Arbitrum Sepolia
  optimism: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Optimism Sepolia
  base: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Base Sepolia
  avalanche: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Avalanche Fuji
};

// Standard ERC20 ABI with allowance and approve functions
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

export default function PublicCheckoutPage() {
  const { slug } = useParams();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState("ethereum"); // Default to Ethereum
  const [paid, setPaid] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'checking' | 'approving' | 'transferring' | 'completed'>('idle');


  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending: isConfirming, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirmed, isSuccess: isConfirmedSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get USDC contract address for selected chain
  const usdcAddress = selectedChain ? USDC_ADDRESSES[selectedChain] : undefined;
  const recipientAddress = selectedChain && checkout ? checkout.recipientWallets[selectedChain] as `0x${string}` : undefined;
  const paymentAmount = checkout ? parseUnits(checkout.amount, 6) : BigInt(0);

  // Check USDC balance
  const { data: balance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(usdcAddress && address),
    },
  });

  // Check allowance (if we were using a spending contract)
  const { data: allowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && recipientAddress ? [address, recipientAddress] : undefined,
    query: {
      enabled: !!(usdcAddress && address && recipientAddress),
    },
  });

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
        
        // Set default chain to the first available supported chain, preferring Ethereum
        const availableChains = CHAINS.filter(chain => 
          data.checkout.supportedChains.includes(chain.value)
        );
        
        if (availableChains.length > 0) {
          // Prefer Ethereum if available, otherwise use the first available chain
          const defaultChain = availableChains.find(chain => chain.value === 'ethereum') || availableChains[0];
          setSelectedChain(defaultChain.value);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckout();
  }, [slug]);

  useEffect(() => {
    if (isConfirmedSuccess && hash && checkout && selectedChain && address) {
      setPaymentStep('completed');
      setPaid(true);
      toast.success('Payment successful!');
      
      // Record the transaction in the database
      const recordTransaction = async () => {
        try {
          const response = await fetch('/api/checkouts/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              checkoutId: checkout.id,
              amount: checkout.amount,
              chain: selectedChain,
              recipientAddress: recipientAddress,
              payerAddress: address,
              transactionHash: hash,
            }),
          });

          if (!response.ok) {
            console.error('Failed to record transaction:', await response.text());
          }
        } catch (error) {
          console.error('Error recording transaction:', error);
        }
      };

      recordTransaction();
    }
  }, [isConfirmedSuccess, hash, checkout, selectedChain, address, recipientAddress]);

  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      
      // Handle different types of errors
      if (writeError.message?.includes('User rejected') || (writeError as any)?.code === 4001) {
        toast.error('Transaction was rejected by user.');
      } else if (writeError.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas or USDC balance.');
      } else {
        toast.error(`Payment failed: ${writeError.message || 'Unknown error'}`);
      }
      
      setPaymentStep('idle');
    }
  }, [writeError]);

  useEffect(() => {
    if (hash) {
      toast.success('Transaction submitted! Waiting for confirmation...');
    }
  }, [hash]);

  // Check if user has sufficient balance
  const hasInsufficientBalance = balance !== undefined && balance < paymentAmount;
  
  const handlePay = async () => {
    if (!checkout || !selectedChain || !isConnected || !address) {
      toast.error('Please select a chain and connect your wallet');
      return;
    }

    if (!usdcAddress || !recipientAddress) {
      toast.error('USDC not supported on this chain');
      return;
    }

    // Validate addresses
    if (!isAddress(usdcAddress)) {
      toast.error('Invalid USDC contract address');
      console.error('Invalid USDC address:', usdcAddress);
      return;
    }

    if (!isAddress(recipientAddress)) {
      toast.error('Invalid recipient address');
      console.error('Invalid recipient address:', recipientAddress);
      return;
    }

    if (hasInsufficientBalance) {
      toast.error(`Insufficient USDC balance. You need ${checkout.amount} USDC but only have ${balance ? (Number(balance) / 1e6).toFixed(2) : '0'} USDC.`);
      return;
    }

    const selectedChainData = CHAINS.find(c => c.value === selectedChain);
    if (!selectedChainData) {
      toast.error('Invalid chain selected');
      return;
    }

    setPaymentStep('checking');

    // Switch chain if needed
    if (chainId !== selectedChainData.chainId) {
      try {
        toast.info('Please approve the network switch in your wallet...');
        await switchChain({ chainId: selectedChainData.chainId });
        toast.success('Network switched successfully!');
      } catch (error) {
        console.error('Error switching chain:', error);
        toast.error('Failed to switch chain. Please switch manually.');
        setPaymentStep('idle');
        return;
      }
    }

    setPaymentStep('transferring');
    toast.info('Please approve the transaction in your wallet...');

    // Call writeContract to initiate the USDC transfer
    writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipientAddress, paymentAmount],
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openTxOnExplorer = (hash: string) => {
    const selectedChainData = CHAINS.find(c => c.value === selectedChain);
    if (!selectedChainData) return;
    
    const explorerUrl = `${selectedChainData.chain.blockExplorers?.default.url}/tx/${hash}`;
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
            
            {hash && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Transaction Hash</Label>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs bg-muted p-2 rounded flex-1 truncate">
                    {hash}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(hash)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openTxOnExplorer(hash)}
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
            <div className="space-y-2">
              <span className="font-medium text-sm">Payment Details</span>
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="text-sm font-medium">
                    {CHAINS.find(c => c.value === selectedChain)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Recipient</span>
                  <div className="text-right">
                    <div className="font-mono text-xs break-all max-w-[200px]">
                      {checkout.recipientWallets[selectedChain]}
                    </div>
                    <button
                      onClick={() => copyToClipboard(checkout.recipientWallets[selectedChain])}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Copy Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show balance information */}
          {isConnected && selectedChain && balance !== undefined && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Your USDC Balance</span>
                <span className={`font-mono text-sm ${hasInsufficientBalance ? 'text-red-600' : 'text-green-600'}`}>
                  {(Number(balance) / 1e6).toFixed(2)} USDC
                </span>
              </div>
              {hasInsufficientBalance && (
                <p className="text-xs text-red-600 mt-1">
                  Insufficient balance. You need {checkout.amount} USDC.
                </p>
              )}
            </div>
          )}
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Connect your wallet to proceed with payment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted border border-muted-foreground/10 rounded-lg">
              <div className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Wallet Connected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chain">Choose Payment Chain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain} required>
                <SelectTrigger id="chain">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableChains.map(chain => (
                    <SelectItem key={chain.value} value={chain.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{chain.label}</span>
                        {chainId === chain.chainId && (
                          <span className="ml-2 text-xs text-green-600">• Connected</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedChain && chainId !== CHAINS.find(c => c.value === selectedChain)?.chainId && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <span className="text-xs text-amber-700">
                    ⚠️ You'll need to switch to {CHAINS.find(c => c.value === selectedChain)?.label} network
                  </span>
                </div>
              )}
              
              {selectedChain && chainId === CHAINS.find(c => c.value === selectedChain)?.chainId && (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <span className="text-xs text-green-700">
                    ✅ Connected to {CHAINS.find(c => c.value === selectedChain)?.label}
                  </span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                paymentStep !== 'idle' || 
                !selectedChain || 
                hasInsufficientBalance
              }
              onClick={handlePay}
            >
              {(() => {
                switch (paymentStep) {
                  case 'checking':
                    return 'Checking...';
                  case 'transferring':
                    return 'Confirming in Wallet...';
                  case 'completed':
                    return 'Payment Complete';
                  default:
                    return hasInsufficientBalance 
                      ? 'Insufficient Balance' 
                      : `Pay ${checkout.amount} USDC`;
                }
              })()}
            </Button>

            {paymentStep === 'idle' && (
              <p className="text-xs text-center text-muted-foreground">
                You will be prompted to approve the transaction in your wallet
              </p>
            )}
            
            {isConfirmed && !isConfirmedSuccess && (
              <p className="text-xs text-center text-blue-600">
                Waiting for transaction confirmation...
              </p>
            )}
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