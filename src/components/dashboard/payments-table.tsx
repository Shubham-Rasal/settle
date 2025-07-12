"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

export type Payment = {
    id: string;
    amount: string;
    chain: "ETH" | "ARB";
    status: "pending" | "complete";
    timestamp: string;
    txHash?: string;
};

const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "id",
        header: "Payment ID",
    },
    {
        accessorKey: "amount",
        header: "Amount (USDC)",
    },
    {
        accessorKey: "chain",
        header: "Chain",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className={`font-medium ${
                    status === "complete" ? "text-green-600" : "text-yellow-600"
                }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
            );
        },
    },
    {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => {
            const timestamp = row.getValue("timestamp") as string;
            return new Date(timestamp).toLocaleString();
        },
    },
    {
        accessorKey: "txHash",
        header: "Transaction Hash",
        cell: ({ row }) => {
            const txHash = row.getValue("txHash") as string;
            if (!txHash) return "-";
            return (
                <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    {`${txHash.slice(0, 6)}...${txHash.slice(-4)}`}
                </a>
            );
        },
    },
];

interface PaymentsTableProps {
    data: Payment[];
}

export function PaymentsTable({ data }: PaymentsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No payments found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 