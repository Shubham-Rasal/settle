"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CHAINS = [
  { label: "Ethereum", value: "ethereum" },
  { label: "Polygon", value: "polygon" },
  { label: "Arbitrum", value: "arbitrum" },
  { label: "Optimism", value: "optimism" },
  { label: "Base", value: "base" },
  { label: "Avalanche", value: "avalanche" },
  { label: "Solana", value: "solana" },
];

// Mock function to fetch checkout config by id
function getCheckoutById(id: string) {
  // In a real app, fetch from backend
  return {
    id,
    title: "Demo Checkout",
    amount: "25.00",
    recipients: {
      ethereum: "0x1234...eth",
      polygon: "0x5678...poly",
      arbitrum: "0x9abc...arb",
      optimism: "0xdef0...opt",
      base: "0x1111...base",
      avalanche: "0x2222...avax",
      solana: "So1anaAddre55...",
    } as Record<string, string>, // Add index signature
  };
}

export default function CheckoutPayPage() {
  const { id } = useParams();
  const checkout = getCheckoutById(typeof id === "string" ? id : Array.isArray(id) ? id[0] : "");
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedChain, setSelectedChain] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handleConnectWallet = () => {
    // Mock wallet connect
    setWalletConnected(true);
  };

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      setPaid(true);
      setIsPaying(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2 text-center">{checkout.title}</h1>
        <div className="text-center text-muted-foreground mb-6">Pay with USDC</div>
        <Separator className="mb-6" />
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Amount</span>
            <span>{checkout.amount} USDC</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Recipient</span>
            <span className="truncate max-w-[180px]">{selectedChain ? checkout.recipients[selectedChain] : "Select a chain"}</span>
          </div>
        </div>
        <div className="mb-4 gap-2">
              <Label htmlFor="chain">Choose Chain to Pay On</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain} required>
                <SelectTrigger id="chain">
                  <SelectValue placeholder="Select a chain" />
                </SelectTrigger>
                <SelectContent>
                  {CHAINS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        <Separator className="mb-6" />
        {!walletConnected ? (
          <Button className="w-full" onClick={handleConnectWallet}>
            Connect Wallet
          </Button>
        ) : paid ? (
          <div className="text-center text-green-600 font-semibold">Payment Successful!</div>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              handlePay();
            }}
            className="space-y-4"
          >
            
            <Button type="submit" className="w-full" disabled={isPaying || !selectedChain}>
              {isPaying ? "Processing..." : `Pay ${checkout.amount} USDC`}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
} 