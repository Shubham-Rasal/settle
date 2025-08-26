import { NextResponse } from 'next/server';
import { MetricData } from '@/components/dashboard/summary-metrics';
import { db } from '@/db';
import { checkoutTransaction, checkout, rebalanceTransaction } from '@/db/schema';
import { getSession } from '@/lib/auth/server';
import { sql, eq, and, gte, lt } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000);

        // Calculate today's volume
        const todayVolumeResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${checkoutTransaction.amount} AS DECIMAL)), 0)`,
                count: sql<number>`COUNT(*)`
            })
            .from(checkoutTransaction)
            .where(
                and(
                    eq(checkoutTransaction.userId, userId),
                    eq(checkoutTransaction.status, 'completed'),
                    gte(checkoutTransaction.createdAt, today)
                )
            );

        // Calculate yesterday's volume for comparison
        const yesterdayVolumeResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${checkoutTransaction.amount} AS DECIMAL)), 0)`,
            })
            .from(checkoutTransaction)
            .where(
                and(
                    eq(checkoutTransaction.userId, userId),
                    eq(checkoutTransaction.status, 'completed'),
                    gte(checkoutTransaction.createdAt, yesterday),
                    lt(checkoutTransaction.createdAt, today)
                )
            );

        // Calculate total volume (all time)
        const totalVolumeResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${checkoutTransaction.amount} AS DECIMAL)), 0)`,
                count: sql<number>`COUNT(*)`
            })
            .from(checkoutTransaction)
            .where(
                and(
                    eq(checkoutTransaction.userId, userId),
                    eq(checkoutTransaction.status, 'completed')
                )
            );

        // Count active checkouts
        const activeCheckoutsResult = await db
            .select({
                count: sql<number>`COUNT(*)`
            })
            .from(checkout)
            .where(
                and(
                    eq(checkout.userId, userId),
                    eq(checkout.status, 'active')
                )
            );

        // Count pending rebalances
        const pendingRebalancesResult = await db
            .select({
                count: sql<number>`COUNT(*)`
            })
            .from(rebalanceTransaction)
            .where(
                and(
                    eq(rebalanceTransaction.userId, userId),
                    sql`${rebalanceTransaction.status} IN ('pending', 'approving', 'burning', 'attesting', 'minting')`
                )
            );

        // Calculate metrics
        const todayVolume = parseFloat(todayVolumeResult[0]?.total || '0');
        const yesterdayVolume = parseFloat(yesterdayVolumeResult[0]?.total || '0');
        const totalVolume = parseFloat(totalVolumeResult[0]?.total || '0');
        const totalTransactions = totalVolumeResult[0]?.count || 0;
        const activeCheckouts = activeCheckoutsResult[0]?.count || 0;
        const pendingRebalances = pendingRebalancesResult[0]?.count || 0;

        // Calculate percentage changes
        const volumeChange = yesterdayVolume > 0 
            ? ((todayVolume - yesterdayVolume) / yesterdayVolume) * 100 
            : todayVolume > 0 ? 100 : 0;

        const avgTransactionSize = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

        const metrics: MetricData = {
            totalVolume: `${todayVolume.toFixed(2)} USDC`,
            volumeChange: Math.round(volumeChange * 100) / 100,
            activeCustomers: activeCheckouts,
            customerChange: 0, // Could calculate change in active checkouts if needed
            successfulPayments: pendingRebalances,
            paymentChange: 0, // Could calculate change in pending rebalances if needed
            avgTransactionSize: `${avgTransactionSize.toFixed(2)} USDC`,
            transactionSizeChange: 0, // Could calculate change in avg transaction size if needed
        };

        return NextResponse.json(metrics);
    } catch (error) {
        console.error('Error calculating metrics:', error);
        
        // Fallback to safe default values
        const fallbackMetrics: MetricData = {
            totalVolume: '0 USDC',
            volumeChange: 0,
            activeCustomers: 0,
            customerChange: 0,
            successfulPayments: 0,
            paymentChange: 0,
            avgTransactionSize: '0 USDC',
            transactionSizeChange: 0,
        };
        
        return NextResponse.json(fallbackMetrics);
    }
} 