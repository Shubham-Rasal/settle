'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { blockchainNames, Blockchain } from "@/lib/types"
import { RebalanceSettings } from "@/components/dashboard/rebalance-settings"
import { WalletFlow } from "@/components/dashboard/wallet-flow"
import { TokenBalance } from "@/components/dashboard/token-balance"
import { Skeleton } from "@/components/ui/skeleton"
import { RebalanceProgress } from "@/components/dashboard/rebalance-progress"
import { RebalanceTimer } from "@/components/dashboard/rebalance-timer"
import { RebalanceLog } from "@/components/dashboard/rebalance-log"
import { useRebalance } from "@/hooks/use-rebalance"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { RefreshCw } from "lucide-react"

interface Wallet {
  id: string
  name: string
  blockchain: Blockchain
  address: string
  isTreasuryWallet: boolean
  privateKey?: string // Add for direct blockchain interaction
}

interface RebalanceSettingsData {
  treasuryWalletId: string
  autoRebalance: boolean
  rebalanceMode: 'gas_free' | 'fast'
  targetBalancePercentage: number
  minRebalanceAmount: number
}

function formatAmount(amount: number): string {
  return (amount / 1_000_000).toFixed(2)
}

function DirectBalanceDisplay({ 
  connectedAddress,
  blockchain 
}: { 
  connectedAddress: string | undefined
  blockchain: Blockchain | ""
}) {
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { getBalance } = useRebalance()

  useEffect(() => {
    if (blockchain && connectedAddress) {
      fetchBalance()
    } else {
      setBalance(null)
    }
  }, [blockchain, connectedAddress])

  const fetchBalance = async () => {
    if (!blockchain || !connectedAddress) return
    
    setIsLoading(true)
    try {
      const balanceResult = await getBalance(connectedAddress, blockchain as Blockchain)
      setBalance(balanceResult)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance(null)
      toast.error("Failed to fetch wallet balance")
    } finally {
      setIsLoading(false)
    }
  }

  if (!blockchain) {
    return (
      <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
        Select a source chain to view balance
      </div>
    )
  }

  if (!connectedAddress) {
    return (
      <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
        Connect your wallet to view balance
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Balance (Direct)</span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={fetchBalance}
          disabled={isLoading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm font-medium">USDC</span>
            <span className="text-xs text-muted-foreground">
              {blockchainNames[blockchain as Blockchain]}
            </span>
          </div>
          <div className="text-sm font-mono text-muted-foreground">
            Loading...
          </div>
        </div>
      ) : balance !== null ? (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm font-medium">USDC</span>
            <span className="text-xs text-muted-foreground">
              {blockchainNames[blockchain as Blockchain]}
            </span>
          </div>
          <span className="text-sm font-mono">
            {parseFloat(balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6
            })}
          </span>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
          Failed to fetch balance
        </div>
      )}
    </div>
  )
}



function ManualRebalance({ 
  wallets, 
  treasuryWallet, 
  selectedWallet, 
  onWalletSelect,
  selectedTreasuryWallet,
  onTreasuryWalletSelect
}: { 
  wallets: Wallet[]
  treasuryWallet: Wallet | null
  selectedWallet: string
  onWalletSelect: (walletId: string) => void
  selectedTreasuryWallet: string
  onTreasuryWalletSelect: (walletId: string) => void
}) {
  const [amount, setAmount] = useState("0.1")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showFinalTime, setShowFinalTime] = useState(false)
  const [useDevWallet, setUseDevWallet] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [selectedSourceChain, setSelectedSourceChain] = useState<Blockchain | "">(Blockchain.ETH_SEPOLIA)
  const [selectedDestChain, setSelectedDestChain] = useState<Blockchain | "">(Blockchain.BASE_SEPOLIA)
  const queryClient = useQueryClient()
  
  const { currentStep, logs, error, executeRebalance, reset: resetRebalance, isConnected, address } = useRebalance()
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount()

  const sourceWallets = wallets.filter(w => w.id !== selectedTreasuryWallet)
  const availableTreasuryWallets = wallets

  const handleDevWalletRebalance = async () => {
    try {
      const sourceWallet = wallets.find(w => w.id === selectedWallet)
      const treasuryWallet = wallets.find(w => w.id === selectedTreasuryWallet)
      
      if (!sourceWallet || !treasuryWallet) {
        throw new Error("Invalid wallet selection")
      }

      const response = await fetch("/api/wallets/rebalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceWalletId: selectedWallet,
          destinationWalletId: selectedTreasuryWallet,
          amount: parseFloat(amount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start rebalance")
      }

      queryClient.invalidateQueries({ queryKey: ["rebalance-transactions"] })
      toast.success("Rebalance started successfully")
      
      // Reset form
      onWalletSelect("")
      setAmount("")
    } catch (error) {
      console.error("Error starting dev wallet rebalance:", error)
      toast.error(error instanceof Error ? error.message : "Failed to start rebalance")
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setShowFinalTime(false)
      setElapsedSeconds(0)
      
      if (useDevWallet) {
        await handleDevWalletRebalance()
        return
      }
      
      // Show progress dialog for user wallet mode
      setShowProgressDialog(true)
      
      const sourceWallet = wallets.find(w => w.id === selectedWallet)
      const treasuryWallet = wallets.find(w => w.id === selectedTreasuryWallet)
      
      if (!sourceWallet || !treasuryWallet) {
        throw new Error("Invalid wallet selection")
      }

      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first")
      }

      if (!selectedSourceChain || !selectedDestChain) {
        throw new Error("Please select both source and destination chains")
      }

      await executeRebalance(
        selectedSourceChain,
        selectedDestChain,
        amount,
        treasuryWallet.address, // Use treasury wallet address as destination
        selectedWallet,
        selectedTreasuryWallet
      )
      
      if (currentStep === "completed") {
        queryClient.invalidateQueries({ queryKey: ["rebalance-transactions"] })
        toast.success("Rebalance completed successfully")
        setShowFinalTime(true)
        
        // Reset form after a delay and close dialog
        setTimeout(() => {
          onWalletSelect("")
          setAmount("0.1")
          setSelectedSourceChain(Blockchain.ETH_SEPOLIA)
          setSelectedDestChain(Blockchain.BASE_SEPOLIA)
          setShowProgressDialog(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error starting rebalance:", error)
      toast.error("Failed to start rebalance")
    } finally {
      setIsSubmitting(false)
    }
  }



  const handleReset = () => {
    resetRebalance()
    setShowFinalTime(false)
    setElapsedSeconds(0)
    setIsSubmitting(false)
    setShowProgressDialog(false)
    onWalletSelect("")
    setAmount("0.1")
    setSelectedSourceChain(Blockchain.ETH_SEPOLIA)
    setSelectedDestChain(Blockchain.BASE_SEPOLIA)
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Manual Rebalance</h2>
      <div className="space-y-6">
        {/* Wallet Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Wallet Mode</Label>
            <p className="text-xs text-muted-foreground">
              {useDevWallet 
                ? "Using dev wallet (API-based, no private keys required)" 
                : "Using user wallets (direct blockchain interaction)"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="wallet-mode" className="text-sm">
              {useDevWallet ? "Dev Wallet" : "User Wallets"}
            </Label>
            <Switch
              id="wallet-mode"
              checked={useDevWallet}
              onCheckedChange={setUseDevWallet}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Chain Selection - only for user wallet mode */}
        {!useDevWallet && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Chain</Label>
              <Select
                value={selectedSourceChain}
                onValueChange={(value) => setSelectedSourceChain(value as Blockchain)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source chain" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(blockchainNames).map(([blockchain, name]) => (
                    <SelectItem key={blockchain} value={blockchain}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destination Chain</Label>
              <Select
                value={selectedDestChain}
                onValueChange={(value) => setSelectedDestChain(value as Blockchain)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination chain" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(blockchainNames).map(([blockchain, name]) => (
                    <SelectItem key={blockchain} value={blockchain}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Chain Operation Indicator */}
        {!useDevWallet && selectedSourceChain && selectedDestChain && (
          <div className={`p-3 rounded-lg border ${
            selectedSourceChain === selectedDestChain 
              ? 'bg-primary/5 border-primary/20' 
              : 'bg-secondary/50 border-border'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  selectedSourceChain === selectedDestChain 
                    ? 'text-primary' 
                    : 'text-foreground'
                }`}>
                  {selectedSourceChain === selectedDestChain ? 'Same-Chain Transfer' : 'Cross-Chain Transfer'}
                </p>
                <p className={`text-xs ${
                  selectedSourceChain === selectedDestChain 
                    ? 'text-primary/80' 
                    : 'text-muted-foreground'
                }`}>
                  {selectedSourceChain === selectedDestChain 
                    ? 'Direct USDC transfer on the same blockchain'
                    : 'CCTP burn/mint process across different blockchains'
                  }
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                selectedSourceChain === selectedDestChain 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {selectedSourceChain === selectedDestChain ? 'Fast' : 'Standard'}
              </div>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Source Wallet</Label>
            <Select 
              value={selectedWallet} 
              onValueChange={onWalletSelect}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source wallet" />
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
            <Label>Treasury Wallet (Destination)</Label>
            <Select 
              value={selectedTreasuryWallet} 
              onValueChange={onTreasuryWalletSelect}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select treasury wallet" />
              </SelectTrigger>
              <SelectContent>
                {availableTreasuryWallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({blockchainNames[wallet.blockchain]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWallet && (
            <div className="space-y-2">
              <Label>Wallet Balance</Label>
              {useDevWallet ? (
                <TokenBalance 
                  walletId={selectedWallet} 
                  walletName={sourceWallets.find(w => w.id === selectedWallet)?.name}
                  compact={true}
                />
              ) : (
                <DirectBalanceDisplay 
                  connectedAddress={address}
                  blockchain={selectedSourceChain}
                />
              )}
            </div>
          )}

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
                disabled={isSubmitting}
              />
              <span className="text-muted-foreground">USDC</span>
            </div>
          </div>

          {!useDevWallet && !isConnected && (
            <div className="space-y-2">
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <p className="text-sm text-foreground font-medium">
                  Wallet Connection Required
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please connect your wallet to proceed with the rebalance
                </p>
                <div className="mt-3">
                  <ConnectButton />
                </div>
              </div>
            </div>
          )}

          {!useDevWallet && isConnected && (
            <div className="space-y-2">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <p className="text-xs text-primary/80 mt-1">
                  Ready for direct blockchain interaction
                </p>
              </div>
            </div>
          )}
        </div>





        {/* Timer - only for user wallet mode */}
        {!useDevWallet && isSubmitting && (
          <div className="text-center">
            {showFinalTime ? (
              <div className="text-2xl font-mono">
                <span>{Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}</span>:
                <span>{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
              </div>
            ) : (
              <RebalanceTimer
                isRunning={isSubmitting}
                onTick={setElapsedSeconds}
              />
            )}
          </div>
        )}

        {/* Progress Steps - only for user wallet mode */}
        {!useDevWallet && currentStep !== "idle" && (
          <RebalanceProgress 
            currentStep={currentStep} 
            isSameChain={selectedSourceChain === selectedDestChain}
            open={showProgressDialog}
            onOpenChange={setShowProgressDialog}
          />
        )}

        {/* Logs - only for user wallet mode */}
        {!useDevWallet && <RebalanceLog logs={logs} />}

        {/* Error Display - only for user wallet mode */}
        {!useDevWallet && error && (
          <div className="text-red-500 text-center p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}



        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={
              !selectedWallet || 
              !selectedTreasuryWallet || 
              !amount || 
              isSubmitting || 
              selectedWallet === selectedTreasuryWallet || 
              (!useDevWallet && (!isConnected || !selectedSourceChain || !selectedDestChain || currentStep === 'completed'))
            }
          >
            {!useDevWallet && currentStep === 'completed' ? 'Rebalance Complete' : isSubmitting ? "Processing..." : "Start Rebalance"}
          </Button>

          {!useDevWallet && (currentStep === 'completed' || currentStep === 'error') && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-[200px]" /> {/* Manual rebalance skeleton */}
        </Card>
        <Card className="p-6">
          <Skeleton className="h-[200px]" /> {/* Flow skeleton */}
        </Card>
      </div>

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
    </div>
  )
}

export default function RebalancePage() {
  const queryClient = useQueryClient()
  const [selectedWallet, setSelectedWallet] = useState("")
  const [selectedTreasuryWallet, setSelectedTreasuryWallet] = useState("")

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

  const walletsWithTreasuryFlag = wallets?.map((wallet: Wallet) => ({
    ...wallet,
    isTreasuryWallet: settings?.treasuryWalletId === wallet.id
  })) || []

  const treasuryWallet = walletsWithTreasuryFlag.find((w: Wallet) => settings?.treasuryWalletId === w.id) || null

  // Initialize treasury wallet selection from settings
  useEffect(() => {
    if (settings?.treasuryWalletId && !selectedTreasuryWallet) {
      setSelectedTreasuryWallet(settings.treasuryWalletId)
    }
  }, [settings?.treasuryWalletId, selectedTreasuryWallet])

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

  if (walletsLoading || settingsLoading) {
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
        <div className="grid md:grid-cols-2 gap-6">
          <ManualRebalance 
            wallets={walletsWithTreasuryFlag} 
            treasuryWallet={treasuryWallet}
            selectedWallet={selectedWallet}
            onWalletSelect={setSelectedWallet}
            selectedTreasuryWallet={selectedTreasuryWallet}
            onTreasuryWalletSelect={setSelectedTreasuryWallet}
          />
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Wallet Flow</h2>
            <WalletFlow
              wallets={walletsWithTreasuryFlag}
              treasuryWalletId={settings?.treasuryWalletId || null}
            />
          </Card>
        </div>
        <RebalanceSettings
          wallets={walletsWithTreasuryFlag}
          currentSettings={settings || undefined}
          onSave={handleSaveSettings}
        />
      </div>
    </div>
  )
} 