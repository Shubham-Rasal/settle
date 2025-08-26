import { PaymentsTable, type Payment } from "@/components/dashboard/payments-table";
import { ChainBalances, type ChainBalance } from "@/components/dashboard/chain-balances";
import { SummaryMetrics, type MetricData } from "@/components/dashboard/summary-metrics";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { Coins, TrendingUp, Users, RefreshCw } from "lucide-react";

async function getDashboardData(userId: string) {
    // Fetch real data from APIs
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        const [metricsResponse, paymentsResponse, walletsResponse] = await Promise.all([
            fetch(`${baseUrl}/api/metrics`, { cache: 'no-store' }),
            fetch(`${baseUrl}/api/checkouts/transactions`, { cache: 'no-store' }),
            fetch(`${baseUrl}/api/wallets`, { cache: 'no-store' })
        ]);

        const metrics = metricsResponse.ok ? await metricsResponse.json() : null;
        const payments = paymentsResponse.ok ? await paymentsResponse.json() : [];
        const wallets = walletsResponse.ok ? await walletsResponse.json() : [];

        // Calculate total treasury from all wallets
        let totalTreasury = 0;
        let treasuryBalances: ChainBalance[] = [];

        // Fetch balances for each wallet
        for (const wallet of wallets) {
            try {
                const balanceResponse = await fetch(
                    `${baseUrl}/api/wallets/balance?walletId=${wallet.id}`,
                    { cache: 'no-store' }
                );
                if (balanceResponse.ok) {
                    const balanceData = await balanceResponse.json();
                    const tokenBalances = balanceData?.data?.tokenBalances || [];
                    
                    for (const tokenBalance of tokenBalances) {
                        if (tokenBalance.token?.symbol === 'USDC') {
                            const amount = parseFloat(tokenBalance.amount || '0');
                            totalTreasury += amount;
                            
                            // Map blockchain to expected chain format
                            let chainName: "ETH" | "ARB";
                            if (wallet.blockchain.toLowerCase() === 'ethereum') {
                                chainName = "ETH";
                            } else if (wallet.blockchain.toLowerCase() === 'arbitrum') {
                                chainName = "ARB";
                            } else {
                                // Skip unsupported chains for now
                                continue;
                            }
                            
                            const existingBalance = treasuryBalances.find(b => b.chain === chainName);
                            if (existingBalance) {
                                const currentAmount = parseFloat(existingBalance.balance);
                                existingBalance.balance = (currentAmount + amount).toFixed(2);
                            } else {
                                treasuryBalances.push({
                                    chain: chainName,
                                    balance: amount.toFixed(2)
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching balance for wallet ${wallet.id}:`, error);
            }
        }

        return { 
            metrics, 
            payments: payments.slice(0, 5), // Only show recent 5 payments
            totalTreasury: totalTreasury.toFixed(2),
            treasuryBalances
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return { 
            metrics: null, 
            payments: [], 
            totalTreasury: '0.00',
            treasuryBalances: []
        };
    }
}

export default async function DashboardPage() {
    const session = await getSession();
 
    if(!session?.user?.id) {
        redirect("/login")
    }

    const { metrics, payments, totalTreasury, treasuryBalances } = await getDashboardData(session.user.id);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Treasury Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage your USDC payments and cross-chain treasury
                    </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    CCTP Connected
                </Badge>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Treasury</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalTreasury}</div>
                        <p className="text-xs text-muted-foreground">USDC across all chains</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalVolume || '$0.00 USDC'}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics?.volumeChange ? (
                                `${metrics.volumeChange >= 0 ? '+' : ''}${metrics.volumeChange}% from yesterday`
                            ) : (
                                'No change from yesterday'
                            )}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Checkouts</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.activeCustomers || 0}</div>
                        <p className="text-xs text-muted-foreground">Open payment intents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Rebalances</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.successfulPayments || 0}</div>
                        <p className="text-xs text-muted-foreground">CCTP transfers in progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <QuickActions />
            </div>

            <Separator />

            {/* Recent Payments */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Recent Payments</h3>
                    <a href="/dashboard/transactions" className="text-sm text-muted-foreground hover:text-foreground">
                        View all →
                    </a>
                </div>
                {payments.length > 0 ? (
                    <PaymentsTable data={payments} />
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-center">
                                <h4 className="text-lg font-medium text-muted-foreground mb-2">No payments yet</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Create your first checkout to start accepting USDC payments
                                </p>
                                <Button asChild>
                                    <a href="/dashboard/checkout">Create Checkout</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Separator />

            {/* Chain Distribution */}
            {treasuryBalances.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium mb-4">Chain Distribution</h3>
                    <ChainBalances balances={treasuryBalances} />
                </div>
            )}
        </div>
    );
}