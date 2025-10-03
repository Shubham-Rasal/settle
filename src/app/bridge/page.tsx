'use client'
import React, { useEffect, useState } from 'react'
import Bridge from '@/components/dashboard/bridge'
import { ConnectKitButton } from 'connectkit'
import { Card } from '@/components/ui/card'
import { ArrowRight, Info } from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type TransactionInfo = {
  burnTxHash: string
  sourceChain: string
  destinationChain: string
  amount: string
  timestamp: number
  status: string
  statusUrl: string
  mintTx?: string
}

function LastTransaction() {
  const [txInfo, setTxInfo] = useState<TransactionInfo | null>(null)

  useEffect(() => {
    const storedTx = localStorage.getItem('cctp_last_tx')
    if (storedTx) {
      setTxInfo(JSON.parse(storedTx))
    }
  }, [])

  if (!txInfo) return null

  return (
    <Card className="p-6 bg-card/95">
      <h2 className="text-xl font-semibold mb-4">Last Transfer</h2>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{txInfo.sourceChain}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-muted-foreground">{txInfo.destinationChain}</span>
        </div>
        <div>
          <span className="font-medium">{txInfo.amount}</span> USDC
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(txInfo.timestamp).toLocaleString()}
        </div>
        <div className="flex gap-4 mt-2">
          <a 
            href={txInfo.statusUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View Status →
          </a>
          
        </div>
      </div>
    </Card>
  )
}

function BridgePage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold mb-2">Cross-Chain USDC Bridge</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">Powered by CCTP V2</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">Public Good</span>
            </div>
            <span>•</span>
            <a 
              href="https://github.com/settle-finance/settle-sdk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a 
              href="https://docs.circle.com/en/cross-chain-transfer-protocol/overview" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              CCTP Docs
            </a>
          </div>
        </div>
        <ConnectKitButton/>
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* <div className="lg:col-span-3"> */}
          <Bridge />
        {/* </div> */}
        {/* <div> */}
          <LastTransaction />
        {/* </div> */}
      </div>
    </div>
  )
}

export default BridgePage