"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export type MetricData = {
    totalVolume: string;  // Storage in GB
    volumeChange: number;
    activeCustomers: number;  // Compute in hours
    customerChange: number;
    successfulPayments: number;  // Branch Compute in hours
    paymentChange: number;
    avgTransactionSize: string;  // Data Transfer in GB
    transactionSizeChange: number;
};

interface SummaryMetricsProps {
    data: MetricData;
}

export function SummaryMetrics({ data }: SummaryMetricsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-medium">{data.totalVolume}</p>
                        <div className="flex items-center text-xs">
                            {data.volumeChange >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-primary" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-destructive" />
                            )}
                            <span className={data.volumeChange >= 0 ? "text-primary" : "text-destructive"}>
                                {Math.abs(data.volumeChange)}%
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">Compute</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-medium">{data.activeCustomers}</p>
                        <div className="flex items-center text-xs">
                            {data.customerChange >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-primary" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-destructive" />
                            )}
                            <span className={data.customerChange >= 0 ? "text-primary" : "text-destructive"}>
                                {Math.abs(data.customerChange)}%
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">Branch Compute</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-medium">{data.successfulPayments}</p>
                        <div className="flex items-center text-xs">
                            {data.paymentChange >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-primary" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-destructive" />
                            )}
                            <span className={data.paymentChange >= 0 ? "text-primary" : "text-destructive"}>
                                {Math.abs(data.paymentChange)}%
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">Data Transfer</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-medium">{data.avgTransactionSize}</p>
                        <div className="flex items-center text-xs">
                            {data.transactionSizeChange >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-primary" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-destructive" />
                            )}
                            <span className={data.transactionSizeChange >= 0 ? "text-primary" : "text-destructive"}>
                                {Math.abs(data.transactionSizeChange)}%
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
} 