"use client";

import { useState } from "react";
import { BridgingKit } from "@circle-fin/bridging-kit";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

// Supported chains for bridging
const supportedChains = {
  Ethereum_Sepolia: "Ethereum Sepolia",
  Base_Sepolia: "Base Sepolia",
} as const;

type SupportedChain = keyof typeof supportedChains;

function TestCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Initialize the bridging kit
const kit = new BridgingKit();

export default function BridgeKitTestPage() {
  const { isConnected } = useAccount();
  const [isBridging, setIsBridging] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [sourceChain, setSourceChain] =
    useState<SupportedChain>("Ethereum_Sepolia");
  const [destinationChain, setDestinationChain] =
    useState<SupportedChain>("Base_Sepolia");
  const [amount, setAmount] = useState("");
  const [estimatedFees, setEstimatedFees] = useState<{
    fees: number;
    gasFees: number;
  } | null>(null);
  const [transactions, setTransactions] = useState<
    Array<{
      hash: string;
      status: "pending" | "completed" | "failed";
      timestamp: number;
      amount: string;
      from: string;
      to: string;
    }>
  >([]);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);

  const estimateBridgeCosts = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      setIsEstimating(true);

      const adapter = await createAdapterFromProvider({
        provider: window.ethereum as any,
        chain: sourceChain,
      });

      const estimate = await kit.estimate({
        from: { adapter, chain: sourceChain },
        to: { adapter, chain: destinationChain },
        amount,
      });

      // Extract numeric values from the estimate
      const fees = estimate.fees.reduce((total, fee) => {
        const amount =
          typeof fee.amount === "string" ? parseFloat(fee.amount) : fee.amount;
        return total + (amount || 0);
      }, 0);
      const gasFees = estimate.gasFees.reduce((total, fee) => {
        const gasEstimate = typeof fee === "number" ? fee : 0;
        return total + gasEstimate;
      }, 0);

      setEstimatedFees({
        fees,
        gasFees,
      });
      toast.success("Cost estimation completed");
    } catch (error) {
      console.error("Error estimating costs:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to estimate costs"
      );
      setEstimatedFees(null);
    } finally {
      setIsEstimating(false);
    }
  };

  const executeBridge = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      setIsBridging(true);

      const adapter = await createAdapterFromProvider({
        provider: window.ethereum as any,
        chain: sourceChain,
      });

      const result = await kit.bridge({
        from: { adapter, chain: sourceChain },
        to: { adapter, chain: destinationChain },
        amount,
        config: { transferSpeed: "FAST" },
      });

      // Start monitoring the transaction
      kit.on("mint", (event) => {
        toast.success("Bridge completed successfully");
      });

      if (result.state === "success") {
        toast.success("Bridge operation initiated");
        
      } else {
        throw new Error("Bridge operation failed");
      }
    } catch (error) {
      console.error("Error executing bridge:", error);
      toast.error(
        error instanceof Error ? error.message : "Bridge operation failed"
      );
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bridge Kit (Beta)</h1>
      </div>

      <div className="grid gap-6">
        <TestCard title="Wallet Connection">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Connected" : "Not connected"}
              </p>
            </div>
            <ConnectKitButton />
          </div>
        </TestCard>

        {isConnected && (
          <div className="space-y-6">
            <TestCard title="Transaction History">
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No transactions yet
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.hash}
                      className="p-4 bg-muted rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status</span>
                        <span
                          className={`text-sm font-medium ${
                            tx.status === "completed"
                              ? "text-green-500"
                              : tx.status === "failed"
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {tx.status.charAt(0).toUpperCase() +
                            tx.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Amount</span>
                        <span className="text-sm font-mono">
                          {tx.amount} USDC
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">From</span>
                        <span className="text-sm">{tx.from}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">To</span>
                        <span className="text-sm">{tx.to}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Transaction Hash
                        </span>
                        <span className="text-sm font-mono">
                          {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Time</span>
                        <span className="text-sm">
                          {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TestCard>
            <TestCard title="Bridge Configuration">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Chain</Label>
                  <Select
                    value={sourceChain}
                    onValueChange={(value) =>
                      setSourceChain(value as SupportedChain)
                    }
                    disabled={isBridging}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportedChains).map(([chain, name]) => (
                        <SelectItem key={chain} value={chain}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Destination Chain</Label>
                  <Select
                    value={destinationChain}
                    onValueChange={(value) =>
                      setDestinationChain(value as SupportedChain)
                    }
                    disabled={isBridging}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportedChains)
                        .filter(([chain]) => chain !== sourceChain)
                        .map(([chain, name]) => (
                          <SelectItem key={chain} value={chain}>
                            {name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (USDC)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isBridging}
                    min="0"
                    step="0.01"
                  />
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={estimateBridgeCosts}
                  disabled={
                    !isConnected ||
                    isEstimating ||
                    !amount ||
                    parseFloat(amount) <= 0
                  }
                >
                  {isEstimating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Estimate Costs
                    </>
                  )}
                </Button>

                {estimatedFees && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Protocol Fees</span>
                      <span className="text-sm font-mono">
                        {estimatedFees.fees.toFixed(6)} USDC
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Gas Fees</span>
                      <span className="text-sm font-mono">
                        {estimatedFees.gasFees.toFixed(6)} USDC
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                      <span className="text-sm font-medium">Total Cost</span>
                      <span className="text-sm font-mono">
                        {(estimatedFees.fees + estimatedFees.gasFees).toFixed(
                          6
                        )}{" "}
                        USDC
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={executeBridge}
                  disabled={
                    !isConnected ||
                    isBridging ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    sourceChain === destinationChain ||
                    !estimatedFees
                  }
                >
                  {isBridging ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Bridging...
                    </>
                  ) : (
                    "Execute Bridge"
                  )}
                </Button>
              </div>
            </TestCard>
          </div>
        )}
      </div>
    </div>
  );
}
