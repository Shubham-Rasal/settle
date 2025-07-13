'use client'

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { blockchainNames, Blockchain } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  userId: string
  sourceWalletId: string
  treasuryWalletId: string
  amount: number
  sourceChain: Blockchain
  destinationChain: Blockchain
  status: 'PENDING' | 'APPROVING' | 'BURNING' | 'ATTESTING' | 'MINTING' | 'COMPLETED' | 'FAILED'
  error?: string
  approveTransactionId?: string
  burnTransactionId?: string
  mintTransactionId?: string
  messageBytes?: string
  messageHash?: string
  attestation?: string
  createdAt: string
  updatedAt: string
}

function formatAmount(amount: number): string {
  return (amount / 1_000_000).toFixed(2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  let className = '';
  switch (status) {
    case 'COMPLETED':
      className = 'bg-primary text-primary-foreground';
      break;
    case 'FAILED':
      className = 'bg-destructive text-destructive-foreground';
      break;
    case 'PENDING':
    case 'APPROVING':
    case 'BURNING':
    case 'ATTESTING':
    case 'MINTING':
      className = 'bg-secondary text-secondary-foreground';
      break;
    default:
      className = 'bg-muted text-muted-foreground';
  }
  
  return (
    <Badge variant="outline" className={`capitalize ${className}`}>
      {status.toLowerCase()}
    </Badge>
  )
}

function TransactionLink({ txId }: { txId: string }) {
  // This is a placeholder - you'll need to implement the actual chain explorer URL logic
  return (
    <Link href={`https://explorer.circle.com/tx/${txId}`} target="_blank" className="flex items-center hover:text-primary">
      <span className="truncate max-w-[100px]">{txId}</span>
      <ExternalLink className="h-3 w-3 ml-1" />
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-[300px]" />
    </Card>
  )
}

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/wallets/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    }
  })

  if (isLoading) {
    // Skeleton table with headers and rows to mimic real data
    return (
      <Card className="p-6">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-28" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>From Chain</TableHead>
              <TableHead>To Chain</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Transaction IDs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {tx.id.slice(0, 8)}...{tx.id.slice(-6)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={tx.status} />
                    {tx.error && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs break-words">{tx.error}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatAmount(tx.amount)} USDC</TableCell>
                <TableCell>{blockchainNames[tx.sourceChain]}</TableCell>
                <TableCell>{blockchainNames[tx.destinationChain]}</TableCell>
                <TableCell>
                  <span>
                    <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (
                        {(() => {
                          const now = new Date();
                          const created = new Date(tx.createdAt);
                          const diffMs = now.getTime() - created.getTime();
                          const diffSec = Math.floor(diffMs / 1000);
                          const diffMin = Math.floor(diffSec / 60);
                          const diffHour = Math.floor(diffMin / 60);
                          const diffDay = Math.floor(diffHour / 24);

                          if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
                          if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
                          if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
                          return "just now";
                        })()}
                      )
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {tx.approveTransactionId && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Approve:</span>
                        <Link href={`https://etherscan.io/tx/${tx.approveTransactionId}`} target="_blank" className="flex items-center hover:text-accent-foreground">
                          {tx.approveTransactionId.slice(0, 8)}...{tx.approveTransactionId.slice(-6)}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    )}
                    {tx.burnTransactionId && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Burn:</span>
                        <Link href={`https://etherscan.io/tx/${tx.burnTransactionId}`} target="_blank" className="flex items-center hover:text-accent-foreground">
                          {tx.burnTransactionId.slice(0, 8)}...{tx.burnTransactionId.slice(-6)}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    )}
                    {tx.mintTransactionId && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Mint:</span>
                        <Link href={`https://etherscan.io/tx/${tx.mintTransactionId}`} target="_blank" className="flex items-center hover:text-accent-foreground">
                          {tx.mintTransactionId.slice(0, 8)}...{tx.mintTransactionId.slice(-6)}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
} 