"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { RebalanceSettings } from "@/components/dashboard/rebalance-settings"
import { WalletFlow } from "@/components/dashboard/wallet-flow"
import { toast } from "sonner"

interface Wallet {
  id: string
  name: string
  blockchain: string
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

export default function RebalancePage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [settings, setSettings] = useState<RebalanceSettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletsRes, settingsRes] = await Promise.all([
          fetch('/api/wallets'),
          fetch('/api/wallets/rebalance-settings')
        ])

        if (!walletsRes.ok || !settingsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [walletsData, settingsData] = await Promise.all([
          walletsRes.json(),
          settingsRes.json()
        ])

        // Add isTreasuryWallet field to each wallet based on settings
        const walletsWithTreasuryFlag = walletsData.map((wallet: Wallet) => ({
          ...wallet,
          isTreasuryWallet: settingsData?.treasuryWalletId === wallet.id
        }))
        
        setWallets(walletsWithTreasuryFlag)
        setSettings(settingsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

      // Update wallets with new treasury wallet flag
      setWallets(wallets.map(wallet => ({
        ...wallet,
        isTreasuryWallet: newSettings.treasuryWalletId === wallet.id
      })))
      
      setSettings(newSettings)
      toast.success("Rebalance settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save rebalance settings")
      throw error
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-center text-gray-500">Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rebalance Settings</h1>
      <div className="grid gap-6">
        <RebalanceSettings
          wallets={wallets}
          currentSettings={settings || undefined}
          onSave={handleSaveSettings}
        />
        <Card className="p-6">
          <WalletFlow
            wallets={wallets}
            treasuryWalletId={settings?.treasuryWalletId || null}
          />
        </Card>
      </div>
    </div>
  )
} 