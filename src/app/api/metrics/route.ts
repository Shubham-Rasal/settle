import { NextResponse } from 'next/server';
import { MetricData } from '@/components/dashboard/summary-metrics';

// TODO: Replace with real aggregation logic
const mockMetrics: MetricData = {
    totalVolume: '400 USDC',
    volumeChange: 0,
    activeCustomers: 0.28,
    customerChange: 0,
    successfulPayments: 0.04,
    paymentChange: 0,
    avgTransactionSize: '0 USDC',
    transactionSizeChange: 0,
};

export async function GET() {
    // In the future, aggregate real metrics here
    return NextResponse.json(mockMetrics);
} 