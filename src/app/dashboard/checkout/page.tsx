"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateCheckoutDialog } from "@/components/dashboard/create-checkout-dialog";

interface Checkout {
  id: string;
  title: string;
  amount: string;
  chain: string;
  url: string;
}

export default function CheckoutPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCheckouts = async () => {
    try {
      const response = await fetch('/api/checkouts');
      if (response.ok) {
        const data = await response.json();
        setCheckouts(data.checkouts);
      }
    } catch (error) {
      console.error('Failed to fetch checkouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const handleDialogClose = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      // Refetch checkouts when dialog closes to get newly created ones
      fetchCheckouts();
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Checkout Pages</h1>
        <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Checkout
        </Button>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Checkout Pages</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading checkouts...</p>
        ) : checkouts.length === 0 ? (
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
      
      <CreateCheckoutDialog 
        open={createDialogOpen} 
        onOpenChange={handleDialogClose}
      />
    </div>
  );
} 