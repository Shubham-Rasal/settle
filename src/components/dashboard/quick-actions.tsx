"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Plus, RefreshCw, ShoppingCart } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Checkout
                    </CardTitle>
                    <CardDescription>
                        Generate a new USDC payment link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard/checkout">
                        <Button className="w-full justify-between">
                            Create Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Rebalance Treasury
                    </CardTitle>
                    <CardDescription>
                        Move USDC between chains via CCTP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard/rebalance">
                        <Button className="w-full justify-between">
                            Rebalance Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        View Checkouts
                    </CardTitle>
                    <CardDescription>
                        Manage all payment links and status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard/checkout">
                        <Button 
                            className="w-full justify-between"
                            variant="outline"
                        >
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
} 