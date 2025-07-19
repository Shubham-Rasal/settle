import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
}

export function WalletCard({ id, name, chain, address, onRefresh }: WalletCardProps) {
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
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
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