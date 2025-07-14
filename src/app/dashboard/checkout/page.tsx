"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

const CHAINS = [
  { label: "Ethereum", value: "ethereum" },
  { label: "Polygon", value: "polygon" },
  { label: "Arbitrum", value: "arbitrum" },
  { label: "Optimism", value: "optimism" },
  { label: "Base", value: "base" },
  { label: "Avalanche", value: "avalanche" },
  { label: "Solana", value: "solana" },
];

interface Checkout {
  id: string;
  title: string;
  amount: string;
  chain: string;
  url: string;
}

export default function CheckoutPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("");
  const [checkouts, setCheckouts] = useState<Checkout[]>([
    {
      id: "1",
      title: "Demo Checkout",
      amount: "25.00",
      chain: "ethereum",
      url: "https://settle.capital/checkout/demo-1",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock creation logic
    setTimeout(() => {
      const newCheckout: Checkout = {
        id: Math.random().toString(36).substring(2, 10),
        title,
        amount,
        chain: "all", // Indicate all chains supported
        url: `https://settle.capital/${Math.random().toString(36).substring(2, 10)}`,
      };
      setCheckouts([newCheckout, ...checkouts]);
      setTitle("");
      setAmount("");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Create Checkout Page</h1>
      <Card className="p-6 max-w-xl">
        <form onSubmit={handleCreateCheckout} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. T-shirt, Donation, etc."
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting || !title || !amount || !chain}>
            {isSubmitting ? "Creating..." : "Create Checkout"}
          </Button>
        </form>
        <div className="mt-6">
          <Label>Supported Chains</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {CHAINS.map(chain => (
              <div key={chain.value} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                <span>{chain.label}</span>
                <Check className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Separator />
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Checkout Pages</h2>
        {checkouts.length === 0 ? (
          <p className="text-muted-foreground">No checkouts created yet.</p>
        ) : (
          <div className="space-y-4">
            {checkouts.map(c => (
              <Card key={c.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-muted-foreground">{c.amount} USDC on All Supported Chains</div>
                </div>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 md:mt-0 text-primary underline text-sm"
                >
                  View Checkout Link
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 