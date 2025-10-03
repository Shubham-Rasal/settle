"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { Loader2, ArrowRight, Clock, Zap } from "lucide-react";
import { useUSDCBalance } from "@/hooks/use-usdc-balance";
import { Blockchain } from "@/lib/types";
import { CHAIN_CONFIG } from "@/lib/chain-config";

// CCTP V2 Contract ABIs
const USDC_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const TOKEN_MESSENGER_ABI = [
  {
    type: "function",
    name: "depositForBurn",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
    ],
    outputs: [],
  },
] as const;

const MESSAGE_TRANSMITTER_ABI = [
  {
    type: "function",
    name: "receiveMessage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [],
  },
] as const;


import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Bridge() {
  const { address, isConnected } = useAccount();
  const [isBridging, setIsBridging] = useState(false);
  const [networkType, setNetworkType] = useState<"mainnet" | "testnet">(
    "mainnet"
  );
  const [sourceChain, setSourceChain] = useState<Blockchain>(Blockchain.BASE_SEPOLIA);
  const [destinationChain, setDestinationChain] =
    useState<Blockchain>(Blockchain.OP_SEPOLIA);
  const [amount, setAmount] = useState("");
  const [transferSpeed, setTransferSpeed] = useState<"FAST" | "SLOW">("FAST");

  // Get USDC balances for source and destination chains
  const sourceBlockchain = useMemo(
    () => sourceChain,
    [sourceChain]  
  );
  const destinationBlockchain = useMemo(
    () => destinationChain,
    [destinationChain]
  );

  // Get balances for all chains
  const sourceBalanceResult = useUSDCBalance(
    address || "",
    sourceChain
  );
  const destinationBalanceResult = useUSDCBalance(
    address || "",
    destinationChain
  );
  // Get source and destination balances
  const sourceBalance = sourceBalanceResult || { balance: '0', isLoading: false, error: null };
  const destinationBalance = destinationBalanceResult || { balance: '0', isLoading: false, error: null };

  const handleSourceChainChange = (value: string) => {
    setSourceChain(value as Blockchain);
  };

  const handleDestinationChainChange = (value: string) => {
    setDestinationChain(value as Blockchain);
  };

  const [burnTxHash, setBurnTxHash] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cctp_burn_tx");
    }
    return null;
  });
  const [burnTxStatus, setBurnTxStatus] = useState<"pending" | "completed" | "failed" | null>(null);
  const [mintStatus, setMintStatus] = useState<"pending" | "completed" | "failed" | null>(null);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const retrieveAttestation = async (transactionHash: string, sourceDomain: number) => {
    // const url = `https://iris-api-sandbox.circle.com/v2/messages/${sourceDomain}?transactionHash=${transactionHash}`;
    const isMainnet = networkType === "mainnet";
    const url = isMainnet
      ? `https://iris-api.circle.com/v2/messages/${sourceDomain}?transactionHash=${transactionHash}`
      : `https://iris-api-sandbox.circle.com/v2/messages/${sourceDomain}?transactionHash=${transactionHash}`;
    while (true) {
      try {
        const response = await fetch(url);
        if (response.status === 404) {
          const toastId = toast.loading("Waiting for attestation...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          toast.dismiss(toastId);
          continue;
        }
        
        const data = await response.json();
        if (data?.messages?.[0]?.status === "complete") {
          toast.success("Attestation retrieved successfully!");
          return data.messages[0];
        }
        
        const toastId2 = toast.loading("Waiting for attestation...");
        toast.dismiss(toastId2);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error("Error fetching attestation:", error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  };

  const getChainConfig = (chain: Blockchain) => {
    //CHAIN_CONFIG
    return CHAIN_CONFIG[chain as Blockchain];
  };  

  const completeBridge = async () => {
    if (!burnTxHash || !walletClient) return;

    setMintStatus("pending");
    let mintToastId: string | number | undefined;
    let approveToastId: string | number | undefined;
    let burnToastId: string | number | undefined;
    try {
      // Switch to destination chain first
      const switched = await switchToChain(destinationChain);
      if (!switched) {
        setMintStatus(null);
        return;
      }

      const sourceConfig = getChainConfig(sourceChain);
      const destConfig = getChainConfig(destinationChain);

      // Retrieve attestation
      approveToastId = toast.loading("Retrieving attestation...");
      const attestation = await retrieveAttestation(burnTxHash, sourceConfig.domain);
      toast.dismiss(approveToastId);
      // Execute mint on destination chain
      mintToastId = toast.loading("Minting USDC on destination chain...");
      const mintTx = await walletClient.writeContract({
        address: destConfig.messageTransmitterAddress as `0x${string}`,
        abi: MESSAGE_TRANSMITTER_ABI,
        functionName: "receiveMessage",
        args: [attestation.message as `0x${string}`, attestation.attestation as `0x${string}`],
      });
      console.log(mintTx);
      let receipt = null;
      if (publicClient) {
        receipt = await publicClient.waitForTransactionReceipt({ hash: mintTx });
      }
      
      console.log(receipt);

      // Store the completed transaction info
      const txInfo = {
        burnTxHash,
        sourceChain,
        destinationChain,
        amount,
        timestamp: Date.now(),
        status: "completed",
        statusUrl: `https://usdc.range.org/status?id=${sourceChain.toLowerCase()}/${burnTxHash}`,
        mintTx: receipt?.transactionHash
      };
      console.log("Transfer completed:", txInfo);
      localStorage.setItem("cctp_last_tx", JSON.stringify(txInfo));
      toast.success("Transfer details stored", {
        description: `From ${sourceChain} to ${destinationChain}\nAmount: ${amount} USDC`,
        duration: 5000
      });
      
      // Clear burn tx hash since the transfer is complete
      localStorage.removeItem("cctp_burn_tx");
      setBurnTxHash(null);
      setBurnTxStatus(null);
      setMintStatus("completed");
      toast.dismiss(mintToastId);
      toast.success("Transfer completed successfully!");
    } catch (error) {
      console.error("Error completing bridge:", error);
      toast.dismiss(mintToastId);
      toast.dismiss(approveToastId);
      toast.dismiss(burnToastId);
      setMintStatus("failed");
      toast.error("Failed to complete transfer");
    }
  };

  const { switchChain } = useSwitchChain();



  const switchToChain = async (chain: Blockchain) => {
    try {
      const config = getChainConfig(chain);
      
      // Show loading toast
      const loadingToast = toast.loading(`Switching to ${chain.replace(/_/g, " ")}...`);
      
      // Switch chain and wait for it to complete
      switchChain({ chainId: config.chainId });
      // walletClient?.switchChain({ id: config.chainId });
      

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Successfully switched to ${chain.replace(/_/g, " ")}`);
      
      return true;
    } catch (error) {
      console.error("Error switching chain:", error);
      toast.error(
        "Failed to switch chain. Please switch manually in your wallet."
      );
      return false;
    }
  };

  const executeBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsBridging(true);
    setBurnTxStatus("pending");

    let approveToastId: string | undefined;
    let burnToastId: string | undefined;

    try {
      // Switch to source chain first
      const switched = await switchToChain(sourceChain as Blockchain);
      if (!switched) {
        setIsBridging(false);
        setBurnTxStatus(null);
        return;
      }

      const sourceConfig = getChainConfig(sourceChain as Blockchain);
      const destConfig = getChainConfig(destinationChain as Blockchain);
      
      // Convert amount to wei (6 decimals for USDC)
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
      const maxFee = BigInt(500); // 0.0005 USDC

      // Format destination address to bytes32
      const destinationAddressBytes32 = `0x000000000000000000000000${address.slice(2)}` as `0x${string}`;
      const destinationCallerBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

      // Step 1: Approve USDC
      const approveTx = await walletClient.writeContract({
        address: sourceConfig.usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: "approve",
        args: [sourceConfig.tokenMessengerAddress as `0x${string}`, amountInWei],
      });

      

      const approveToastId = toast.loading("Approving USDC...");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }
        toast.dismiss(approveToastId);
      toast.success("USDC approved successfully!");

      // Step 2: Burn USDC
      const burnTx = await walletClient.writeContract({
        address: sourceConfig.tokenMessengerAddress as `0x${string}`,
        abi: TOKEN_MESSENGER_ABI,
        functionName: "depositForBurn",
        args: [
          amountInWei,
          Number(destConfig.domain),
          destinationAddressBytes32,
          sourceConfig.usdcAddress as `0x${string}`,
          destinationCallerBytes32,
          maxFee,
          transferSpeed === "FAST" ? 1000 : 2000,
        ],
      });

      const burnToastId = toast.loading("Burning USDC...");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: burnTx });
      }
      toast.dismiss(burnToastId);
      // Store burn transaction hash in local storage
      localStorage.setItem("cctp_burn_tx", burnTx);
      setBurnTxHash(burnTx);
      setBurnTxStatus("completed");
      
      toast.success("USDC burned successfully! Click 'Complete Transfer' to mint on destination chain.");
    } catch (error) {
      console.error("Error executing bridge:", error);
      toast.dismiss(approveToastId);
      toast.dismiss(burnToastId);
      setBurnTxStatus("failed");
      toast.error("Bridge operation failed");
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-8 space-y-2 bg-card/95 shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Zap className="w-8 h-8 text-primary" />
          Start Bridging
        </h1>
      </div>

      <p className="text-lg text-muted-foreground">
        Move your USDC instantly with zero added fees.
      </p>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <Tabs
              value={networkType}
              onValueChange={(value) =>
                setNetworkType(value as "mainnet" | "testnet")
              }
              className="w-full"
            >
              <TabsList className="">
                <TabsTrigger value="mainnet" className="py-3 text-lg">Mainnet</TabsTrigger>
                <TabsTrigger value="testnet" className="py-3 text-lg">Testnet</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <label className="text-lg font-medium mb-3 block">
                Source Chain
              </label>
              <Select
                value={sourceChain}
                onValueChange={handleSourceChainChange}
              >
                <SelectTrigger className="w-full py-6 px-4 text-lg">
                  <SelectValue>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{sourceChain}</span>
                      </div>
                      {isConnected && sourceBlockchain && (
                        <div className="text-lg text-muted-foreground">
                          {sourceBalance.isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            `${Number(sourceBalance.balance).toFixed(2)} USDC`
                          )}
                        </div>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="p-2">
                  {Object.entries(CHAIN_CONFIG)
                    .filter(([key]) => networkType === "mainnet" ? 
                      !key.includes("SEPOLIA") && !key.includes("FUJI") && !key.includes("DEVNET") && !key.includes("AMOY") && !key.includes("BLAZE") :
                      key.includes("SEPOLIA") || key.includes("FUJI") || key.includes("DEVNET") || key.includes("AMOY") || key.includes("BLAZE")
                    )
                    .map(([key, chain]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        disabled={key === destinationChain}
                        className="py-1 px-2 text-lg"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <span>{key.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden md:block pt-8">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <label className="text-lg font-medium mb-3 block">
                Destination Chain
              </label>
              <Select
                value={destinationChain}
                onValueChange={handleDestinationChainChange}
              >
                <SelectTrigger className="w-full py-6 px-4 text-lg">
                  <SelectValue>
                    <div className="flex justify-between gap-4 w-full">
                      <div className="flex items-center gap-3">
                       <span className="text-lg">{destinationChain}</span>
                      </div>
                      {isConnected && destinationBlockchain && (
                        <div className="text-lg text-muted-foreground">
                          {destinationBalance.isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            `${Number(destinationBalance.balance).toFixed(
                              2
                            )} USDC`
                          )}
                        </div>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="p-2">
                  {Object.entries(CHAIN_CONFIG)
                    .filter(([key]) => networkType === "mainnet" ? 
                      !key.includes("SEPOLIA") && !key.includes("FUJI") && !key.includes("DEVNET") && !key.includes("AMOY") && !key.includes("BLAZE") :
                      key.includes("SEPOLIA") || key.includes("FUJI") || key.includes("DEVNET") || key.includes("AMOY") || key.includes("BLAZE")
                    )
                    .map(([key, chain]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        disabled={key === sourceChain}
                        className="py-1 px-2 text-lg"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <span>{key.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-lg font-medium">Amount</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <span className="text-lg">USDC</span>
              </div>
              <Input
                type="number"
                placeholder="0.0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-16 py-6 text-2xl text-right pr-2"
                min="0"
                step="0.01"
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 p-6 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="py-2 px-4 text-base">
                <Clock className="w-4 h-4 mr-2" />
                {transferSpeed === "FAST" ? "~30 seconds" : "~20 minutes"}
              </Badge>

            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg">{transferSpeed === "FAST" ? "Fast" : "Slow"} Transfer</span>
              <button 
                onClick={() => setTransferSpeed(transferSpeed === "FAST" ? "SLOW" : "FAST")}
                className="w-14 h-7 bg-primary/20 rounded-full flex items-center p-1 cursor-pointer"
                style={{ justifyContent: transferSpeed === "FAST" ? "flex-end" : "flex-start" }}
              >
                <div className="w-5 h-5 rounded-full bg-primary transition-all duration-200"></div>
              </button>
            </div>
          </div>
          {/* Moved to top title section */}
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <Button
              className="w-full py-6 text-lg"
              onClick={executeBridge}
              disabled={isBridging || !amount || parseFloat(amount) <= 0 || burnTxStatus === "completed"}
            >
              {isBridging ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  {burnTxStatus === "pending" ? "Processing..." : "Bridging..."}
                </>
              ) : burnTxStatus === "completed" ? (
                "USDC Burned Successfully"
              ) : (
                "Start Transfer"
              )}
            </Button>

            {burnTxStatus === "completed" && (
              <Button
                className="w-full py-6 text-lg"
                onClick={completeBridge}
                disabled={mintStatus === "pending"}
              >
                {mintStatus === "pending" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Completing Transfer...
                  </>
                ) : mintStatus === "completed" ? (
                  "Transfer Completed!"
                ) : (
                  "Complete Transfer"
                )}
              </Button>
            )}

            {burnTxHash && (
              <div className="space-y-2 text-sm text-muted-foreground text-center">
                <div>
                  Burn Transaction: {burnTxHash.slice(0, 6)}...{burnTxHash.slice(-4)}
                </div>
                {mintStatus === "completed" && (
                  <a 
                    href={`https://usdc.range.org/transactions?s=${burnTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View CCTP Transfer Status →
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <Button className="w-full py-6 text-lg" onClick={() => {}}>
            Connect Wallet
          </Button>
        )}
      </div>
    </Card>
  );
}
