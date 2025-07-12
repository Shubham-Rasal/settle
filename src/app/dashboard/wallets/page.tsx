"use client"

import { CreateWalletDialog } from "@/components/dashboard/create-wallet-dialog"
import { WalletCard } from "@/components/dashboard/wallet-card"

// Temporary mock data - replace with actual data fetching
const mockWallets = [
  {
    id: "1",
    name: "Main ETH Wallet",
    chain: "ethereum",
    address: "0x1234567890123456789012345678901234567890",
    balance: "1.45 ETH",
    privateKey: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "2",
    name: "Arbitrum Operations",
    chain: "arbitrum",
    address: "0x0987654321098765432109876543210987654321",
    balance: "245.67 ARB",
    privateKey: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
  },
  {
    id: "3",
    name: "Optimism Treasury",
    chain: "optimism",
    address: "0x2468135790246813579024681357902468135790",
    balance: "1,234.56 OP",
    privateKey: "0x13579024681357902468135790246813579024681357902468135790246813579",
  },
]

export default function WalletsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wallets</h1>
        <CreateWalletDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockWallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            name={wallet.name}
            chain={wallet.chain}
            address={wallet.address}
            balance={wallet.balance}
            privateKey={wallet.privateKey}
          />
        ))}
      </div>
    </div>
  )
} 