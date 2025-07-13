'use client'

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { blockchainNames, Blockchain } from "@/lib/types"
import { RebalanceSettings } from "@/components/dashboard/rebalance-settings"
import { WalletFlow } from "@/components/dashboard/wallet-flow"
import { Skeleton } from "@/components/ui/skeleton"

interface Wallet {
  id: string
  name: string
  blockchain: Blockchain
  address: string
  isTreasuryWallet: boolean
}

interface RebalanceSettingsData {
  treasuryWalletId: string
  autoRebalance: boolean
  rebalanceMode: 'gas_free' | 'fast'
  targetBalancePercentage: number
  minRebalanceAmount: number
}

interface Transaction {
  id: string
  sourceWalletId: string
  treasuryWalletId: string
  amount: number
  sourceChain: Blockchain
  destinationChain: Blockchain
  status: string
  error?: string
  createdAt: string
}

function formatAmount(amount: number): string {
  return (amount / 1_000_000).toFixed(2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
}

function ManualRebalance({ wallets, treasuryWallet }: { wallets: Wallet[], treasuryWallet: Wallet | null }) {
  const [selectedWallet, setSelectedWallet] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const sourceWallets = wallets.filter(w => !w.isTreasuryWallet)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const amountInSmallestUnit = Math.floor(parseFloat(amount) * 1_000_000)

      const response = await fetch("/api/wallets/rebalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceWalletId: selectedWallet,
          amount: amountInSmallestUnit,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start rebalance")
      }

      const transaction = await response.json()
      queryClient.invalidateQueries({ queryKey: ["rebalance-transactions"] })
      toast.success("Rebalance started successfully")
      setSelectedWallet("")
      setAmount("")
    } catch (error) {
      console.error("Error starting rebalance:", error)
      toast.error("Failed to start rebalance")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!treasuryWallet) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Please select a treasury wallet in the settings above</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Manual Rebalance</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Source Wallet</Label>
          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
            <SelectTrigger>
              <SelectValue placeholder="Select a wallet" />
            </SelectTrigger>
            <SelectContent>
              {sourceWallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name} ({blockchainNames[wallet.blockchain]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Amount (USDC)</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <span className="text-muted-foreground">USDC</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedWallet || !amount || isSubmitting}
        >
          {isSubmitting ? "Starting Rebalance..." : "Start Rebalance"}
        </Button>
      </div>
    </Card>
  )
}

function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  // Show toast notifications for transaction status changes
  useEffect(() => {
    if (!transactions) return

    transactions.forEach((transaction) => {
      switch (transaction.status) {
        case "APPROVING":
          toast.loading("Approving USDC transfer...", {
            id: `approve-${transaction.id}`,
          })
          break
        case "BURNING":
          toast.dismiss(`approve-${transaction.id}`)
          toast.loading("Burning USDC on source chain...", {
            id: `burn-${transaction.id}`,
          })
          break
        case "ATTESTING":
          toast.dismiss(`burn-${transaction.id}`)
          toast.loading("Getting Circle attestation...", {
            id: `attest-${transaction.id}`,
          })
          break
        case "MINTING":
          toast.dismiss(`attest-${transaction.id}`)
          toast.loading("Minting USDC on destination chain...", {
            id: `mint-${transaction.id}`,
          })
          break
        case "COMPLETED":
          toast.dismiss(`mint-${transaction.id}`)
          toast.success("Rebalance completed successfully!")
          break
        case "FAILED":
          // Dismiss any pending toasts for this transaction
          toast.dismiss(`approve-${transaction.id}`)
          toast.dismiss(`burn-${transaction.id}`)
          toast.dismiss(`attest-${transaction.id}`)
          toast.dismiss(`mint-${transaction.id}`)
          toast.error(`Rebalance failed: ${transaction.error || "Unknown error"}`)
          break
      }
    })
  }, [transactions])

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>From Chain</TableHead>
              <TableHead>To Chain</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{formatDate(tx.createdAt)}</TableCell>
                <TableCell>{blockchainNames[tx.sourceChain]}</TableCell>
                <TableCell>{blockchainNames[tx.destinationChain]}</TableCell>
                <TableCell>{formatAmount(tx.amount)} USDC</TableCell>
                <TableCell>
                  <span className={`capitalize ${
                    tx.status === 'COMPLETED' ? 'text-green-600' :
                    tx.status === 'FAILED' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {tx.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No transactions yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6">
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
          <Skeleton className="h-4 w-3/4" /> {/* Help text */}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-28" /> {/* Label */}
            <Skeleton className="h-4 w-48" /> {/* Help text */}
          </div>
          <Skeleton className="h-6 w-11" /> {/* Switch */}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-28" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" /> {/* Label */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-10 w-8" /> {/* % */}
            </div>
            <Skeleton className="h-4 w-2/3" /> {/* Help text */}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-48" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-4 w-3/4" /> {/* Help text */}
          </div>
        </div>

        <Skeleton className="h-10 w-full" /> {/* Button */}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-[200px]" /> {/* Manual rebalance skeleton */}
        </Card>
        <Card className="p-6">
          <Skeleton className="h-[200px]" /> {/* Flow skeleton */}
        </Card>
      </div>

      <Card className="p-6">
        <Skeleton className="h-[300px]" /> {/* Transaction history skeleton */}
      </Card>
    </div>
  )
}

export default function RebalancePage() {
  const queryClient = useQueryClient()

  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const response = await fetch("/api/wallets")
      if (!response.ok) throw new Error("Failed to fetch wallets")
      return response.json()
    },
  })

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["rebalance-settings"],
    queryFn: async () => {
      const response = await fetch("/api/wallets/rebalance-settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      return response.json()
    },
  })

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["rebalance-transactions"],
    queryFn: async () => {
      const response = await fetch("/api/wallets/rebalance")
      if (!response.ok) throw new Error("Failed to fetch transactions")
      return response.json()
    },
    refetchInterval: 5000, // Poll every 5 seconds
  })

  const walletsWithTreasuryFlag = wallets?.map((wallet: Wallet) => ({
    ...wallet,
    isTreasuryWallet: settings?.treasuryWalletId === wallet.id
  })) || []

  const treasuryWallet = walletsWithTreasuryFlag.find((w: Wallet) => settings?.treasuryWalletId === w.id) || null

  const handleSaveSettings = async (newSettings: RebalanceSettingsData) => {
    try {
      const response = await fetch("/api/wallets/rebalance-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      queryClient.invalidateQueries({ queryKey: ["rebalance-settings"] })
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
      toast.success("Rebalance settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save rebalance settings")
      throw error
    }
  }

  if (walletsLoading || settingsLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Rebalance Settings</h1>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rebalance Settings</h1>
      <div className="grid gap-6">
        <RebalanceSettings
          wallets={walletsWithTreasuryFlag}
          currentSettings={settings || undefined}
          onSave={handleSaveSettings}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <ManualRebalance wallets={walletsWithTreasuryFlag} treasuryWallet={treasuryWallet} />
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Wallet Flow</h2>
            <WalletFlow
              wallets={walletsWithTreasuryFlag}
              treasuryWalletId={settings?.treasuryWalletId || null}
            />
          </Card>
        </div>
        <TransactionHistory transactions={transactions || []} />
      </div>
    </div>
  )
} 