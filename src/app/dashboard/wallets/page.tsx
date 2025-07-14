"use client"

import { useEffect, useState } from "react"
import { CreateWalletDialog } from "@/components/dashboard/create-wallet-dialog"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { Blockchain, blockchainNames } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton";

interface TokenBalance {
  tokenId: string;
  amount: string;
  token: {
    symbol: string;
  };
}

interface Wallet {
  id: string;
  name: string;
  blockchain: Blockchain;
  address: string;
  balances: TokenBalance[];
  controlType: "user" | "developer";
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/wallets")
      if (!response.ok) {
        throw new Error("Failed to fetch wallets")
      }
      const data = await response.json()
      setWallets(data)
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch wallets")
    } finally {
      setIsLoading(false)
    }
  }

  const developerWallets = wallets.filter(wallet => wallet.controlType === "developer")
  const userWallets = wallets.filter(wallet => wallet.controlType === "user")

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Wallets</h1>
          <CreateWalletDialog />
        </div>
        <Tabs defaultValue="developer" className="space-y-4">
          <TabsList>
            <TabsTrigger value="developer" className="flex gap-2">
              Developer-Controlled
            </TabsTrigger>
            <TabsTrigger value="user" className="flex gap-2">
              User-Controlled
            </TabsTrigger>
          </TabsList>
          <TabsContent value="developer" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="user" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wallets</h1>
        <CreateWalletDialog onWalletCreated={fetchWallets} />
      </div>

      <Tabs defaultValue="developer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="developer" className="flex gap-2">
            Developer-Controlled
            {developerWallets.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                {developerWallets.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="user" className="flex gap-2">
            User-Controlled
            {userWallets.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                {userWallets.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="developer" className="space-y-4">
          {developerWallets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No developer-controlled wallets yet.</p>
              <p className="text-sm">Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {developerWallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  name={wallet.name}
                  chain={wallet.blockchain}
                  address={wallet.address}
                  balances={wallet.balances}
                  onRefresh={fetchWallets}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          {userWallets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No user-controlled wallets yet.</p>
              <p className="text-sm">Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userWallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  name={wallet.name}
                  chain={wallet.blockchain}
                  address={wallet.address}
                  balances={wallet.balances}
                  onRefresh={fetchWallets}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="border rounded-lg bg-card p-4 space-y-4 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
} 