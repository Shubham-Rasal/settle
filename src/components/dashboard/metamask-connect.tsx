"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMetaMask } from "@/hooks/use-metamask";
import { toast } from "sonner";
import { Blockchain } from "@/lib/types";

interface MetaMaskConnectProps {
  onWalletAdded: () => void;
}

// Map chain IDs to our Blockchain enum
const CHAIN_ID_TO_BLOCKCHAIN: Record<string, Blockchain> = {
  "0xaa36a7": Blockchain.ETH_SEPOLIA,
  "0x66eee": Blockchain.ARB_SEPOLIA,
  "0x14a34": Blockchain.BASE_SEPOLIA,
  "0xa869": Blockchain.AVAX_FUJI,
  "0x13882": Blockchain.MATIC_AMOY,
  "0xaa37dc": Blockchain.OP_SEPOLIA,
};

export function MetaMaskConnect({ onWalletAdded }: MetaMaskConnectProps) {
  const {
    isMetaMaskInstalled,
    isConnecting,
    isConnected,
    account,
    chainId,
    chainName,
    connectWallet,
    disconnectWallet,
  } = useMetaMask();

  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddWallet = async () => {
    if (!account || !chainId || !walletName.trim()) {
      toast.error("Please provide a wallet name and ensure MetaMask is connected");
      return;
    }

    const blockchain = CHAIN_ID_TO_BLOCKCHAIN[chainId];
    if (!blockchain) {
      toast.error("Unsupported network. Please switch to a supported testnet.");
      return;
    }

    try {
      setIsAddingWallet(true);
      
      // Save the connected wallet to the database
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: walletName.trim(),
          address: account,
          blockchain,
          controlType: "user",
          connectionType: "metamask",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save wallet");
      }

      toast.success("MetaMask wallet added successfully!");
      setWalletName("");
      setIsDialogOpen(false);
      onWalletAdded();
    } catch (error: any) {
      console.error("Failed to add wallet:", error);
      toast.error(error.message || "Failed to add wallet");
    } finally {
      setIsAddingWallet(false);
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4">
            <svg
              className="h-12 w-12 text-orange-500 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">MetaMask Not Detected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please install MetaMask to connect your wallet
          </p>
          <Button
            onClick={() => window.open("https://metamask.io/download/", "_blank")}
            variant="outline"
          >
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            className="h-6 w-6 text-orange-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          MetaMask Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Address:</span>{" "}
                <span className="font-mono text-xs">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Network:</span>{" "}
                <span className="text-xs">{chainName}</span>
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Add Current Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add MetaMask Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Wallet Name</Label>
                    <Input
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      placeholder="e.g., My MetaMask Wallet"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={account || ""}
                      disabled
                      className="font-mono text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Input
                      value={chainName || ""}
                      disabled
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleAddWallet}
                      disabled={isAddingWallet || !walletName.trim()}
                      className="flex-1"
                    >
                      {isAddingWallet ? "Adding..." : "Add Wallet"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your MetaMask wallet to add it to your wallet collection
            </p>
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}