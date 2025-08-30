import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Blockchain, blockchainNames, blockchainLogos } from "@/lib/types"
import Image from "next/image"
import { useEffect, useState } from "react"

interface TokenBalance {
  tokenId: string;
  amount: string;
  token: {
    symbol: string;
  };
}

interface WalletCardProps {
  id: string;
  name: string;
  chain: Blockchain;
  address: string;
  onRefresh?: () => void;
  connectionType?: "generated" | "metamask";
}

export function WalletCard({ id, name, chain, address, onRefresh, connectionType }: WalletCardProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  const fetchBalance = async () => {
    setIsLoadingBalance(true)
    try {
      const response = await fetch(`/api/wallets/balance?walletId=${id}`)
      if (response.ok) {
        const balanceData = await response.json()
        console.log("balanceData", balanceData.tokenBalances);
        setBalances(balanceData.tokenBalances || [])
      } else {
        console.warn(`Failed to fetch balance for wallet ${id}`)
        setBalances([])
      }
    } catch (error) {
      console.warn(`Error fetching balance for wallet ${id}:`, error)
      setBalances([])
    } finally {
      setIsLoadingBalance(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [id])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  const openExplorer = () => {
    // TODO: Add proper explorer URLs for each chain
    window.open(`https://etherscan.io/address/${address}`, "_blank")
  }

  const handleRefresh = async () => {
    await fetchBalance()
    if (onRefresh) {
      onRefresh()
    }
    toast.success("Balance refreshed")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
          {connectionType === "metamask" && (
            <Badge variant="secondary" className="w-fit text-xs">
              <svg
                className="h-3 w-3 text-orange-500 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              MetaMask
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={blockchainLogos[chain]}
            alt={blockchainNames[chain]}
            width={24}
            height={24}
          />
          <span className="text-sm text-muted-foreground">
            {blockchainNames[chain]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Address:</span>
              <span className="text-sm text-muted-foreground">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={openExplorer}>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isLoadingBalance}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Token Balances */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Token Balances</h4>
            {isLoadingBalance ? (
              <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                Loading balances...
              </div>
            ) : balances.length > 0 ? (
              <div className="space-y-2">
                {balances.map((balance, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="text-sm font-medium">{balance.token.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {parseFloat(balance.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                No tokens found
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 