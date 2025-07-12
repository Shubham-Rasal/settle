import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Wallet {
  id: string
  name: string
  blockchain: string
  address: string
  isTreasuryWallet: boolean
}

interface RebalanceSettingsProps {
  wallets: Wallet[]
  currentSettings?: {
    treasuryWalletId: string
    autoRebalance: boolean
    rebalanceMode: 'gas_free' | 'fast'
    targetBalancePercentage: number
    minRebalanceAmount: number
  }
  onSave: (settings: {
    treasuryWalletId: string
    autoRebalance: boolean
    rebalanceMode: 'gas_free' | 'fast'
    targetBalancePercentage: number
    minRebalanceAmount: number
  }) => Promise<void>
}

export function RebalanceSettings({ wallets, currentSettings, onSave }: RebalanceSettingsProps) {
  const [settings, setSettings] = useState(currentSettings || {
    treasuryWalletId: '',
    autoRebalance: false,
    rebalanceMode: 'gas_free' as const,
    targetBalancePercentage: 100,
    minRebalanceAmount: 100,
  })

  const handleSave = async () => {
    try {
      await onSave(settings)
      toast.success("Rebalance settings saved successfully")
    } catch (error) {
      toast.error("Failed to save rebalance settings")
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Treasury Wallet</Label>
          <Select
            value={settings.treasuryWalletId}
            onValueChange={(value) => setSettings({ ...settings, treasuryWalletId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a treasury wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.blockchain})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            All funds from different wallets will be rebalanced and sent to the treasury wallet.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-Rebalance</Label>
            <p className="text-sm text-muted-foreground">
              Automatically rebalance after every transaction
            </p>
          </div>
          <Switch
            checked={settings.autoRebalance}
            onCheckedChange={(checked) => setSettings({ ...settings, autoRebalance: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label>Rebalance Mode</Label>
          <Select
            value={settings.rebalanceMode}
            onValueChange={(value: 'gas_free' | 'fast') => setSettings({ ...settings, rebalanceMode: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gas_free">Gas Free (Slower)</SelectItem>
              <SelectItem value="fast">Fast (Higher Gas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Balance</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min={1}
                max={100}
                value={settings.targetBalancePercentage}
                onChange={(e) => setSettings({ ...settings, targetBalancePercentage: parseInt(e.target.value) })}
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Target percentage to maintain in each wallet
            </p>
          </div>

          <div className="space-y-2">
            <Label>Minimum Rebalance</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min={0}
                value={settings.minRebalanceAmount}
                onChange={(e) => setSettings({ ...settings, minRebalanceAmount: parseInt(e.target.value) })}
              />
              <span className="text-muted-foreground">USD</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum difference to trigger rebalance
            </p>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </div>
    </Card>
  )
} 