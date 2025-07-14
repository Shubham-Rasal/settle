import { PaymentsTable, type Payment } from "@/components/dashboard/payments-table";
import { ChainBalances, type ChainBalance } from "@/components/dashboard/chain-balances";
import { SummaryMetrics, type MetricData } from "@/components/dashboard/summary-metrics";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

// Mock data
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

export default async function DashboardPage() {

    const session = await getSession();
 
    if(!session) {
        redirect("/login")
    }


    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* <Separator /> */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                    <QuickActions
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
                />
            </div>
        </div>
    );
}