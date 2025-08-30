'use client'

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { blockchainNames, Blockchain } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface BaseTransaction {
  id: string
  userId: string
  amount: number
  sourceChain: Blockchain
  destinationChain: Blockchain
  status: 'PENDING' | 'APPROVING' | 'BURNING' | 'ATTESTING' | 'MINTING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
}

interface RebalanceTransaction extends BaseTransaction {
  type: 'rebalance'
  sourceWalletId: string
  treasuryWalletId: string
  error?: string
  approveTransactionId?: string
  burnTransactionId?: string
  mintTransactionId?: string
  messageBytes?: string
  messageHash?: string
  attestation?: string
}

interface UserRebalanceTransaction extends BaseTransaction {
  type: 'user-rebalance'
  sourceUserWalletId: string
  destinationUserWalletId: string
  sourceWalletName?: string
  sourceWalletAddress?: string
  error?: string
  approveTransactionId?: string
  burnTransactionId?: string
  mintTransactionId?: string
  messageBytes?: string
  messageHash?: string
  attestation?: string
}

interface CheckoutTransaction extends BaseTransaction {
  type: 'checkout'
  chain: string
  transactionHash: string
  checkoutTitle: string
  recipientAddress: string
  payerAddress?: string
}

type Transaction = RebalanceTransaction | UserRebalanceTransaction | CheckoutTransaction

function formatAmount(amount: number): string {
  const formatted = amount / 1_000_000;
  if (formatted === 0) return "0";
  if (formatted < 0.01 && formatted > 0) return "<0.01";
  return formatted.toFixed(2);
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

function getExplorerUrl(chain: string, txHash: string): string {
  const explorers: Record<string, string> = {
    ethereum: 'https://sepolia.etherscan.io',
    polygon: 'https://amoy.polygonscan.com',
    arbitrum: 'https://sepolia.arbiscan.io',
    optimism: 'https://sepolia-optimism.etherscan.io',
    base: 'https://sepolia.basescan.org',
    avalanche: 'https://testnet.snowtrace.io',
  }
  
  const baseUrl = explorers[chain] || 'https://etherscan.io'
  return `${baseUrl}/tx/${txHash}`
}

function TransactionLink({ txId, chain }: { txId: string; chain?: string }) {
  const explorerUrl = chain ? getExplorerUrl(chain, txId) : `https://explorer.circle.com/tx/${txId}`
  
  return (
    <Link href={explorerUrl} target="_blank" className="flex items-center hover:text-primary">
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

function CheckoutTransactionsTable({ transactions }: { transactions: CheckoutTransaction[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Chain</TableHead>
            <TableHead>Checkout</TableHead>
            <TableHead>Payer</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Transaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No checkout transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {tx.id.slice(0, 8)}...{tx.id.slice(-6)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={tx.status} />
                </TableCell>
                <TableCell>{formatAmount(tx.amount)} USDC</TableCell>
                <TableCell>{tx.sourceChain}</TableCell>
                <TableCell>
                  <div className="font-medium">{tx.checkoutTitle}</div>
                </TableCell>
                <TableCell>
                  {tx.payerAddress ? (
                    <div className="text-xs text-muted-foreground">
                      {tx.payerAddress.slice(0, 6)}...{tx.payerAddress.slice(-4)}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unknown</span>
                  )}
                </TableCell>
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
                  <TransactionLink txId={tx.transactionHash} chain={tx.sourceChain} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function RebalanceTransactionsTable({ transactions }: { transactions: RebalanceTransaction[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Transaction IDs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No Circle wallet rebalance transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
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
                <TableCell>
                  {blockchainNames[tx.sourceChain]} → {blockchainNames[tx.destinationChain]}
                </TableCell>
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function UserRebalanceTransactionsTable({ transactions }: { transactions: UserRebalanceTransaction[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Source Wallet</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Transaction IDs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No user wallet rebalance transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
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
                <TableCell>
                  {blockchainNames[tx.sourceChain]} → {blockchainNames[tx.destinationChain]}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium text-sm">{tx.sourceWalletName || 'Unknown'}</div>
                    {tx.sourceWalletAddress && (
                      <div className="text-xs text-muted-foreground">
                        {tx.sourceWalletAddress.slice(0, 6)}...{tx.sourceWalletAddress.slice(-4)}
                      </div>
                    )}
                  </div>
                </TableCell>
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
                        <TransactionLink txId={tx.approveTransactionId} chain={tx.sourceChain} />
                      </div>
                    )}
                    {tx.burnTransactionId && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Burn:</span>
                        <TransactionLink txId={tx.burnTransactionId} chain={tx.sourceChain} />
                      </div>
                    )}
                    {tx.mintTransactionId && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Mint:</span>
                        <TransactionLink txId={tx.mintTransactionId} chain={tx.destinationChain} />
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function TransactionsPage() {
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('all')
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/wallets/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    }
  })

  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Filter transactions by type
  const checkoutTransactions = transactions?.filter((tx): tx is CheckoutTransaction => tx.type === 'checkout') || []
  const rebalanceTransactions = transactions?.filter((tx): tx is RebalanceTransaction => tx.type === 'rebalance') || []
  const userRebalanceTransactions = transactions?.filter((tx): tx is UserRebalanceTransaction => tx.type === 'user-rebalance') || []
  
  // Combined rebalance transactions for the tab
  const allRebalanceTransactions = [...rebalanceTransactions, ...userRebalanceTransactions]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checkout" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkout" className="flex items-center gap-2">
            <Badge variant="outline" className="bg-secondary text-secondary-foreground">
              Deposits
            </Badge>
            <span>({checkoutTransactions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rebalance" className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary text-primary-foreground">
              Rebalancing
            </Badge>
            <span>({allRebalanceTransactions.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="checkout" className="mt-6">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Checkout Deposits</h3>
              <p className="text-sm text-muted-foreground">
                Payments received through your checkout links
              </p>
            </div>
            <CheckoutTransactionsTable transactions={checkoutTransactions} />
          </Card>
        </TabsContent>
        
        <TabsContent value="rebalance" className="mt-6">
          <Card className="p-6">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Wallet Rebalancing</h3>
                <p className="text-sm text-muted-foreground">
                  Cross-chain USDC transfers between your wallets
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter:</span>
                <Select value={selectedTransactionType} onValueChange={setSelectedTransactionType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions ({allRebalanceTransactions.length})</SelectItem>
                    <SelectItem value="user-rebalance">User Wallets ({userRebalanceTransactions.length})</SelectItem>
                    <SelectItem value="rebalance">Circle Wallets ({rebalanceTransactions.length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedTransactionType === 'all' && (
              <div className="space-y-6">
                {userRebalanceTransactions.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3 text-primary">User Wallet Transactions</h4>
                    <UserRebalanceTransactionsTable transactions={userRebalanceTransactions} />
                  </div>
                )}
                {rebalanceTransactions.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3 text-accent-foreground">Circle Wallet Transactions</h4>
                    <RebalanceTransactionsTable transactions={rebalanceTransactions} />
                  </div>
                )}
                {allRebalanceTransactions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No rebalance transactions found
                  </div>
                )}
              </div>
            )}
            
            {selectedTransactionType === 'user-rebalance' && (
              <UserRebalanceTransactionsTable transactions={userRebalanceTransactions} />
            )}
            
            {selectedTransactionType === 'rebalance' && (
              <RebalanceTransactionsTable transactions={rebalanceTransactions} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 