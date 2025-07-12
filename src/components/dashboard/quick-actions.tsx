"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Wallet, RefreshCw, Settings } from "lucide-react";

interface QuickActionProps {
    onRebalance: () => void;
    onWithdraw: () => void;
    onSettings: () => void;
}

export function QuickActions({ onRebalance, onWithdraw, onSettings }: QuickActionProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Wallet className="mr-2 h-5 w-5" />
                        Withdraw Funds
                    </CardTitle>
                    <CardDescription>
                        Transfer USDC to your external wallet
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full justify-between"
                        onClick={onWithdraw}
                    >
                        Withdraw Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Rebalance Chains
                    </CardTitle>
                    <CardDescription>
                        Move USDC between chains using CCTP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full justify-between"
                        onClick={onRebalance}
                    >
                        Rebalance Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Settings className="mr-2 h-5 w-5" />
                        Account Settings
                    </CardTitle>
                    <CardDescription>
                        Configure your account preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full justify-between"
                        variant="outline"
                        onClick={onSettings}
                    >
                        Open Settings
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
} 