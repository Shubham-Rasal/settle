"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export type ChainBalance = {
    chain: "ETH" | "ARB";
    balance: string;
};

interface ChainBalancesProps {
    balances: ChainBalance[];
}

export function ChainBalances({ balances }: ChainBalancesProps) {
    const [amount, setAmount] = useState("");
    const [fromChain, setFromChain] = useState<"ETH" | "ARB">("ETH");
    const [toChain, setToChain] = useState<"ETH" | "ARB">("ARB");
    const [loading, setLoading] = useState(false);

    const handleRebalance = async () => {
        try {
            setLoading(true);
            // await onRebalance(amount, fromChain, toChain);
            setAmount("");
        } catch (error) {
            console.error("Rebalance failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {balances.map((balance) => (
                    <div
                        key={balance.chain}
                        className="p-4 rounded-lg border bg-card"
                    >
                        <h3 className="text-lg font-semibold mb-2">
                            {balance.chain === "ETH" ? "Ethereum" : "Arbitrum"} Balance
                        </h3>
                        <p className="text-2xl font-bold">
                            {balance.balance} USDC
                        </p>
                    </div>
                ))}
            </div>

            <div className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold">Rebalance Funds</h3>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (USDC)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="from-chain">From Chain</Label>
                            <select
                                id="from-chain"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={fromChain}
                                onChange={(e) => {
                                    const newFromChain = e.target.value as "ETH" | "ARB";
                                    setFromChain(newFromChain);
                                    if (newFromChain === toChain) {
                                        setToChain(newFromChain === "ETH" ? "ARB" : "ETH");
                                    }
                                }}
                            >
                                <option value="ETH">Ethereum</option>
                                <option value="ARB">Arbitrum</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="to-chain">To Chain</Label>
                            <select
                                id="to-chain"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={toChain}
                                onChange={(e) => {
                                    const newToChain = e.target.value as "ETH" | "ARB";
                                    setToChain(newToChain);
                                    if (newToChain === fromChain) {
                                        setFromChain(newToChain === "ETH" ? "ARB" : "ETH");
                                    }
                                }}
                            >
                                <option value="ETH">Ethereum</option>
                                <option value="ARB">Arbitrum</option>
                            </select>
                        </div>
                    </div>
                    <Button
                        onClick={handleRebalance}
                        disabled={loading || !amount || fromChain === toChain}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Rebalancing...
                            </>
                        ) : (
                            "Rebalance"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
} 