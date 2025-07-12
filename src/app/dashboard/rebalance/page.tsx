"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { RebalanceSettings } from "@/components/dashboard/rebalance-settings"
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
        const walletsRes = await fetch('/api/wallets')

        if (!walletsRes.ok) {
          throw new Error("Failed to fetch wallets")
        }

        const walletsData = await walletsRes.json()
        // Add isTreasuryWallet field to each wallet
        const walletsWithTreasuryFlag = walletsData.map((wallet: Wallet) => ({
          ...wallet,
          isTreasuryWallet: false
        }))
        setWallets(walletsWithTreasuryFlag)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load wallets")
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
      <RebalanceSettings
        wallets={wallets}
        currentSettings={settings || undefined}
        onSave={handleSaveSettings}
      />
    </div>
  )
} 