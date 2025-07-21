import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface TokenBalance {
  tokenId: string
  amount: string
  token: {
    symbol: string
    name?: string
  }
}

interface TokenBalanceProps {
  walletId: string | null
  walletName?: string
  compact?: boolean
}

export function TokenBalance({ walletId, walletName, compact = false }: TokenBalanceProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchBalance = async () => {
    if (!walletId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/wallets/balance?walletId=${walletId}`)
      if (response.ok) {
        const balanceData = await response.json()
        setBalances(balanceData.tokenBalances || [])
      } else {
        console.warn(`Failed to fetch balance for wallet ${walletId}`)
        setBalances([])
        toast.error("Failed to fetch wallet balance")
      }
    } catch (error) {
      console.warn(`Error fetching balance for wallet ${walletId}:`, error)
      setBalances([])
      toast.error("Error fetching wallet balance")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (walletId) {
      fetchBalance()
    } else {
      setBalances([])
    }
  }, [walletId])

  const handleRefresh = async () => {
    await fetchBalance()
    toast.success("Balance refreshed")
  }

  const formatAmount = (amount: string): string => {
    const numAmount = parseFloat(amount)
    if (numAmount === 0) return "0.00"
    
    // For USDC (6 decimals), divide by 1,000,000
    // For other tokens, we'll use a more general approach
    const formatted = numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
    
    return formatted
  }

  if (!walletId) {
    return compact ? null : (
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Token Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Select a wallet to view its token balance
          </p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Balance</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-6 w-6"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ) : balances.length > 0 ? (
          <div className="space-y-2">
            {balances.map((balance, index) => (
              <div 
                key={balance.tokenId || index} 
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <span className="text-sm font-medium">
                  {balance.token.symbol}
                </span>
                <span className="text-sm font-mono">
                  {formatAmount(balance.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No tokens found
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Token Balance</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {walletName && (
          <p className="text-sm text-muted-foreground mb-4">
            Wallet: {walletName}
          </p>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        ) : balances.length > 0 ? (
          <div className="space-y-3">
            {balances.map((balance, index) => (
              <div 
                key={balance.tokenId || index} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {balance.token.symbol}
                  </span>
                  {balance.token.name && (
                    <span className="text-xs text-muted-foreground">
                      {balance.token.name}
                    </span>
                  )}
                </div>
                <span className="text-sm font-mono">
                  {formatAmount(balance.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No tokens found in this wallet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 