"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { Blockchain, blockchainNames } from "@/lib/types";

// Generate chains from the chain config instead of hardcoding them
const CHAINS = Object.entries(Blockchain).map(([key, value]) => {
  // Map blockchain enum values to checkout chain identifiers
  const chainMapping: Record<Blockchain, string> = {
    [Blockchain.ETH_SEPOLIA]: "ethereum",
    [Blockchain.MATIC_AMOY]: "polygon", 
    [Blockchain.ARB_SEPOLIA]: "arbitrum",
    [Blockchain.OP_SEPOLIA]: "optimism",
    [Blockchain.BASE_SEPOLIA]: "base",
    [Blockchain.AVAX_FUJI]: "avalanche",
    [Blockchain.SOL_DEVNET]: "solana",
    [Blockchain.SONIC_BLAZE]: "sonic",
    [Blockchain.LINEA_SEPOLIA]: "linea",
  };
  
  return {
    label: blockchainNames[value as Blockchain],
    value: chainMapping[value as Blockchain],
  };
});

interface Checkout {
  id: string;
  title: string;
  amount: string;
  url: string;
}

interface CreateCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCheckoutDialog({ open, onOpenChange }: CreateCheckoutDialogProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCheckout, setCreatedCheckout] = useState<Checkout | null>(null);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCreatedCheckout(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout');
      }

      const { checkout: newCheckout } = await response.json();
      
      setCreatedCheckout({
        id: newCheckout.id,
        title: newCheckout.title,
        amount: newCheckout.amount,
        url: newCheckout.url,
      });
      toast.success("Checkout page created successfully!");
    } catch (error) {
      console.error('Error creating checkout:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create checkout page";
      
      // Show specific message for missing wallets
      if (errorMessage.includes('No wallets found')) {
        toast.error("Please create Circle wallets first before creating checkout pages.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("URL copied to clipboard!");
  };

  const openCheckout = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (createdCheckout) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout Created Successfully!</DialogTitle>
          </DialogHeader>
          <Card className="p-4 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Title</Label>
              <p className="font-medium">{createdCheckout.title}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Amount</Label>
              <p className="font-medium">{createdCheckout.amount} USDC</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Checkout URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={createdCheckout.url} 
                  readOnly 
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(createdCheckout.url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openCheckout(createdCheckout.url)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Supported Chains</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CHAINS.map(chain => (
                  <div key={chain.value} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                    <span>{chain.label}</span>
                    <Check className="w-3 h-3" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Checkout Page</DialogTitle>
        </DialogHeader>
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
          
          <div>
            <Label className="text-sm text-muted-foreground">Supported Chains</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CHAINS.map(chain => (
                <div key={chain.value} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                  <span>{chain.label}</span>
                  <Check className="w-3 h-3" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title || !amount}>
              {isSubmitting ? "Creating..." : "Create Checkout"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}