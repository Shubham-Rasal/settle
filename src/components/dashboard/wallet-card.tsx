import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Blockchain, blockchainNames, blockchainLogos } from "@/lib/types"
import Image from "next/image"

interface TokenBalance {
  tokenId: string;
  amount: string;
  token: {
    symbol: string;
  };
}

interface WalletCardProps {
  name: string;
  chain: Blockchain;
  address: string;
  balances: TokenBalance[];
  onRefresh?: () => void;
}

export function WalletCard({ name, chain, address, balances, onRefresh }: WalletCardProps) {
  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  const openExplorer = () => {
    // TODO: Add proper explorer URLs for each chain
    window.open(`https://etherscan.io/address/${address}`, "_blank")
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
      toast.success("Refreshing balances...")
    }
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
              <Button variant="ghost" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Balances:</span>
            {balances.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tokens found</div>
            ) : (
              <div className="space-y-1">
                {balances.map((balance) => (
                  <div key={balance.tokenId} className="flex justify-between text-sm">
                    <span>{balance.token.symbol}</span>
                    <span>{balance.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 