import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Copy, Check } from "lucide-react"
import Image from "next/image"

interface WalletCardProps {
  name: string
  chain: string
  address: string
  balance: string
  privateKey: string
}

export function WalletCard({ name, chain, address, balance, privateKey }: WalletCardProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copyAddressStatus, setCopyAddressStatus] = useState<"idle" | "copied">("idle")
  const [copyPrivateKeyStatus, setCopyPrivateKeyStatus] = useState<"idle" | "copied">("idle")

  const clipAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = async (text: string, type: "address" | "privateKey") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "address") {
        setCopyAddressStatus("copied")
        setTimeout(() => setCopyAddressStatus("idle"), 2000)
      } else {
        setCopyPrivateKeyStatus("copied")
        setTimeout(() => setCopyPrivateKeyStatus("idle"), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src={`/chains/${chain}.svg`}
            alt={chain}
            width={24}
            height={24}
            className="rounded-full"
          />
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{chain}</p>
          <p className="font-medium">{balance}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Address</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(address, "address")}
            >
              {copyAddressStatus === "copied" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="font-mono text-sm">{clipAddress(address)}</p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Private Key</p>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(privateKey, "privateKey")}
                disabled={!showPrivateKey}
              >
                {copyPrivateKeyStatus === "copied" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
              >
                {showPrivateKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="font-mono text-sm">
            {showPrivateKey ? clipAddress(privateKey) : "••••••••••••••••"}
          </p>
        </div>
      </div>
    </Card>
  )
} 