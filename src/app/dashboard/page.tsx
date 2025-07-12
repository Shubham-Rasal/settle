"use client";

import { useState } from "react";
import { PaymentsTable, type Payment } from "@/components/dashboard/payments-table";
import { ChainBalances, type ChainBalance } from "@/components/dashboard/chain-balances";
import { SummaryMetrics, type MetricData } from "@/components/dashboard/summary-metrics";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Mock data
const mockMetrics: MetricData = {
    totalVolume: "0.04 GB",
    volumeChange: 0,
    activeCustomers: 0.28,
    customerChange: 0,
    successfulPayments: 0.04,
    paymentChange: 0,
    avgTransactionSize: "0 GB",
    transactionSizeChange: 0,
};

const mockPayments: Payment[] = [
    {
        id: "pay_123",
        amount: "100.00",
        chain: "ETH",
        status: "complete",
        timestamp: new Date().toISOString(),
        txHash: "0x123...abc",
    },
    {
        id: "pay_124",
        amount: "50.00",
        chain: "ARB",
        status: "pending",
        timestamp: new Date().toISOString(),
    },
];

const mockBalances: ChainBalance[] = [
    {
        chain: "ETH",
        balance: "1,000.00",
    },
    {
        chain: "ARB",
        balance: "500.00",
    },
];

export default function DashboardPage() {
    const handleRebalance = async (
        amount: string,
        fromChain: "ETH" | "ARB",
        toChain: "ETH" | "ARB"
    ) => {
        try {
            // TODO: Implement actual rebalancing logic using CCTP
            toast.promise(
                new Promise((resolve) => setTimeout(resolve, 2000)), // Mock delay
                {
                    loading: `Transferring ${amount} USDC from ${fromChain} to ${toChain}...`,
                    success: `Successfully transferred ${amount} USDC from ${fromChain} to ${toChain}`,
                    error: "Failed to transfer funds",
                }
            );
        } catch (error) {
            console.error("Rebalance failed:", error);
            toast.error("Failed to rebalance funds");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <SummaryMetrics data={mockMetrics} />
            <Separator />
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                    <QuickActions
                        onRebalance={() => toast.info("Opening rebalance dialog...")}
                        onWithdraw={() => toast.info("Withdraw functionality coming soon")}
                        onSettings={() => toast.info("Settings functionality coming soon")}
                    />
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    <PaymentsTable data={mockPayments} />
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="text-lg font-medium mb-4">Chain Balances & Rebalancing</h3>
                <ChainBalances
                    balances={mockBalances}
                    onRebalance={handleRebalance}
                />
            </div>
        </div>
    );
}