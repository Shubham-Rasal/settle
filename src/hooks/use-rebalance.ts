"use client";

import { useState } from "react";
import {
  encodeFunctionData,
  type Hex,
  TransactionExecutionError,
  parseUnits,
  createPublicClient,
  formatUnits,
  parseEther,
  http,
} from "viem";
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import axios from "axios";
import {
  sepolia,
  avalancheFuji,
  baseSepolia,
  arbitrumSepolia,
  polygonAmoy,
  optimismSepolia,
  lineaSepolia,
} from "viem/chains";
import { defineChain } from "viem";
import { Blockchain } from "@/lib/types";
import { CHAIN_CONFIG } from "@/lib/chain-config";

// Define Sonic Blaze testnet chain
const sonicBlaze = defineChain({
  id: 57054,
  name: 'Sonic Blaze',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Sonic Testnet Explorer', 
      url: 'https://testnet.sonicscan.org' 
    },
  },
});

export type RebalanceStep =
  | "idle"
  | "initiating"
  | "approving"
  | "transferring"
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";

// Map blockchain types to chain IDs
const BLOCKCHAIN_TO_CHAIN_ID: Record<Blockchain, number> = {
  [Blockchain.ETH_SEPOLIA]: 11155111,
  [Blockchain.ARB_SEPOLIA]: 421614,
  [Blockchain.BASE_SEPOLIA]: 84532,
  [Blockchain.AVAX_FUJI]: 43113,
  [Blockchain.MATIC_AMOY]: 80002,
  [Blockchain.OP_SEPOLIA]: 11155420,
  [Blockchain.SOL_DEVNET]: 1, // Placeholder
  [Blockchain.SONIC_BLAZE]: 57054,
  [Blockchain.LINEA_SEPOLIA]: 59141,
};

// Map blockchain types to viem chains
const chains: Record<number, any> = {
  11155111: sepolia,
  43113: avalancheFuji,
  84532: baseSepolia,
  421614: arbitrumSepolia,
  80002: polygonAmoy,
  11155420: optimismSepolia,
  57054: sonicBlaze,
  59141: lineaSepolia,
};

export function useRebalance() {
  const [currentStep, setCurrentStep] = useState<RebalanceStep>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const DEFAULT_DECIMALS = 6;

  const addLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  const createTransactionRecord = async (
    sourceUserWalletId: string,
    destinationUserWalletId: string,
    amount: string,
    sourceChain: string,
    destinationChain: string
  ) => {
    try {
      const response = await fetch('/api/wallets/user-rebalance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUserWalletId,
          destinationUserWalletId,
          amount,
          sourceChain,
          destinationChain,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction record');
      }

      const data = await response.json();
      setCurrentTransactionId(data.transaction.id);
      return data.transaction.id;
    } catch (error) {
      console.error('Error creating transaction record:', error);
      return null;
    }
  };

  const updateTransactionRecord = async (
    transactionId: string,
    updates: {
      status?: string;
      error?: string;
      approveTransactionId?: string;
      burnTransactionId?: string;
      mintTransactionId?: string;
      messageBytes?: string;
      messageHash?: string;
      attestation?: string;
    }
  ) => {
    try {
      const response = await fetch('/api/wallets/user-rebalance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction record');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction record:', error);
    }
  };

  const getPublicClientForChain = (blockchain: Blockchain) => {
    const chainId = BLOCKCHAIN_TO_CHAIN_ID[blockchain];
    const chain = chains[chainId];
    if (!chain) {
      throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
    
    return createPublicClient({
      chain,
      transport: http(),
    });
  };

  const switchToChain = async (blockchain: Blockchain) => {
    const chainId = BLOCKCHAIN_TO_CHAIN_ID[blockchain];
    try {
      await switchChain({ chainId });
      addLog(`Switched to ${blockchain}`);
    } catch (error) {
      throw new Error(`Failed to switch to ${blockchain}: ${error}`);
    }
  };

  const getBalance = async (userAddress: string, blockchain: Blockchain) => {
    const publicClientForChain = getPublicClientForChain(blockchain);
    const config = CHAIN_CONFIG[blockchain];

    const balance = await publicClientForChain.readContract({
      address: config.usdcAddress as `0x${string}`,
      abi: [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "balanceOf",
      args: [userAddress as `0x${string}`],
    });

    const formattedBalance = formatUnits(balance as bigint, DEFAULT_DECIMALS);
    return formattedBalance;
  };

  const approveUSDC = async (
    sourceBlockchain: Blockchain,
    amount: bigint,
    transactionId?: string,
  ) => {
    setCurrentStep("approving");
    addLog("Approving USDC transfer...");

    try {
      if (transactionId) {
        await updateTransactionRecord(transactionId, { status: 'approving' });
      }

      // Switch to source chain
      await switchToChain(sourceBlockchain);

      const config = CHAIN_CONFIG[sourceBlockchain];
      
      const tx = await writeContractAsync({
        address: config.usdcAddress as `0x${string}`,
        abi: [
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
        ],
        functionName: "approve",
        args: [config.tokenMessengerAddress as `0x${string}`, amount],
      });

      addLog(`USDC Approval Tx: ${tx}`);
      
      if (transactionId) {
        await updateTransactionRecord(transactionId, { 
          approveTransactionId: tx,
          status: 'approved'
        });
      }
      
      return tx;
    } catch (err) {
      setError("Approval failed");
      if (transactionId) {
        await updateTransactionRecord(transactionId, { 
          status: 'failed',
          error: err instanceof Error ? err.message : 'Approval failed'
        });
      }
      throw err;
    }
  };

  const burnUSDC = async (
    sourceBlockchain: Blockchain,
    destinationBlockchain: Blockchain,
    amount: bigint,
    destinationAddress: string,
    transactionId?: string,
  ) => {
    setCurrentStep("transferring");
    addLog(`Burning ${formatUnits(amount, DEFAULT_DECIMALS)} USDC on ${sourceBlockchain}...`);

    try {
      if (transactionId) {
        await updateTransactionRecord(transactionId, { status: 'burning' });
      }

      // Validate inputs
      if (!destinationAddress || destinationAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Invalid destination address");
      }

      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Ensure we're on the source chain
      await switchToChain(sourceBlockchain);

      const sourceConfig = CHAIN_CONFIG[sourceBlockchain];
      const destinationConfig = CHAIN_CONFIG[destinationBlockchain];
      
      addLog(`Source domain: ${sourceConfig.domain}, Destination domain: ${destinationConfig.domain}`);
      addLog(`Token Messenger: ${sourceConfig.tokenMessengerAddress}`);
      addLog(`USDC Address: ${sourceConfig.usdcAddress}`);
      
      const finalityThreshold = 1000; // Standard transfer (1000 or less for Fast Transfer)
      // Set maxFee to a little less than the amount (e.g., 99% of amount)
      const maxFee = amount && typeof amount === "bigint"
        ? amount - amount / BigInt(100)
        : BigInt(0);
      const mintRecipient = `0x${destinationAddress
        .replace(/^0x/, "")
        .padStart(64, "0")}`;

      const tx = await writeContractAsync({
        address: sourceConfig.tokenMessengerAddress as `0x${string}`,
        abi: [
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
        ],
        functionName: "depositForBurn",
        args: [
          amount,
          destinationConfig.domain,
          mintRecipient as Hex,
          sourceConfig.usdcAddress as `0x${string}`,
          "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex, // destinationCaller (empty for any caller)
          maxFee,
          finalityThreshold,
        ],
      });

      addLog(`✅ USDC burn successful! Transaction: ${tx}`);
      addLog(`Burned ${formatUnits(amount, DEFAULT_DECIMALS)} USDC for cross-chain transfer`);
      
      if (transactionId) {
        await updateTransactionRecord(transactionId, { 
          burnTransactionId: tx,
          status: 'attesting'
        });
      }
      
      return tx;
    } catch (err) {
      setError("Burn failed");
      if (transactionId) {
        await updateTransactionRecord(transactionId, { 
          status: 'failed',
          error: err instanceof Error ? err.message : 'Burn failed'
        });
      }
      throw err;
    }
  };

  const retrieveAttestation = async (
    transactionHash: string,
    sourceBlockchain: Blockchain,
    transactionId?: string,
  ) => {
    setCurrentStep("waiting-attestation");
    addLog("Retrieving attestation...");

    const sourceConfig = CHAIN_CONFIG[sourceBlockchain];
    // Use sandbox API endpoint for testnet attestations
    const url = `https://iris-api-sandbox.circle.com/v2/messages/${sourceConfig.domain}?transactionHash=${transactionHash}`;
    
    addLog(`Fetching attestation from domain ${sourceConfig.domain} for tx: ${transactionHash}`);

    while (true) {
      try {
        const response = await axios.get(url);
        const message = response.data?.messages?.[0];
        
        if (message?.status === "complete") {
          // Validate attestation data
          if (!message.attestation || !message.message) {
            throw new Error("Invalid attestation data: missing attestation or message");
          }
          
          addLog("✅ Attestation retrieved and validated!");
          addLog(`Full response structure: ${JSON.stringify(message, null, 2)}`);
          addLog(`Message type: ${typeof message.message}, length: ${message.message?.length}`);
          addLog(`Attestation type: ${typeof message.attestation}, length: ${message.attestation?.length}`);
          addLog(`Message data: ${message.message}`);
          addLog(`Attestation data: ${message.attestation}`);
          
          if (transactionId) {
            await updateTransactionRecord(transactionId, { 
              attestation: message.attestation,
              messageBytes: message.message 
            });
          }
          
          return message;
        }
        addLog("Waiting for attestation...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
        setError("Attestation retrieval failed");
        throw error;
      }
    }
  };

  const mintUSDC = async (
    destinationBlockchain: Blockchain,
    attestation: any,
    transactionId?: string,
  ) => {
    const MAX_RETRIES = 3;
    let retries = 0;
    setCurrentStep("minting");
    addLog("Minting USDC...");

    while (retries < MAX_RETRIES) {
      try {
        // Switch to destination chain
        await switchToChain(destinationBlockchain);

        const config = CHAIN_CONFIG[destinationBlockchain];
        
        addLog(`Using Message Transmitter: ${config.messageTransmitterAddress}`);
        addLog(`Chain: ${destinationBlockchain}, Domain: ${config.domain}`);
        addLog(`Message bytes length: ${attestation.message?.length}`);
        addLog(`Attestation bytes length: ${attestation.attestation?.length}`);
        
        // Check if we're using the correct CCTP v2 Message Transmitter
        const expectedV2MessageTransmitter = "0xe737e5cebeeba77efe34d4aa090756590b1ce275";
        if (config.messageTransmitterAddress.toLowerCase() !== expectedV2MessageTransmitter.toLowerCase()) {
          addLog(`⚠️ Warning: Using non-standard Message Transmitter address for ${destinationBlockchain}`);
          addLog(`Expected v2: ${expectedV2MessageTransmitter}`);
          addLog(`Using: ${config.messageTransmitterAddress}`);
        }
        
        // Ensure data is in correct format for contract call
        const messageBytes = attestation.message as `0x${string}`;
        const attestationBytes = attestation.attestation as `0x${string}`;
        
        addLog(`Calling receiveMessage with:`);
        addLog(`  - Message: ${messageBytes}`);
        addLog(`  - Attestation: ${attestationBytes}`);
        addLog(`  - Message starts with 0x: ${messageBytes.startsWith('0x')}`);
        addLog(`  - Attestation starts with 0x: ${attestationBytes.startsWith('0x')}`);

        const tx = await writeContractAsync({
          address: config.messageTransmitterAddress as `0x${string}`,
          abi: [
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
          ],
          functionName: "receiveMessage",
          args: [messageBytes, attestationBytes],
        });

        addLog(`Mint Tx: ${tx}`);
        
        if (transactionId) {
          await updateTransactionRecord(transactionId, { 
            mintTransactionId: tx,
            status: 'completed'
          });
        }
        
        setCurrentStep("completed");
        break;
      } catch (err) {
        if (err instanceof TransactionExecutionError && retries < MAX_RETRIES) {
          retries++;
          addLog(`Retry ${retries}/${MAX_RETRIES}...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
          continue;
        }
        if (transactionId) {
          await updateTransactionRecord(transactionId, { 
            status: 'failed',
            error: err instanceof Error ? err.message : 'Minting failed'
          });
        }
        throw err;
      }
    }
  };

  const transferSameChain = async (
    sourceBlockchain: Blockchain,
    amount: bigint,
    destinationAddress: string,
    transactionId?: string,
  ) => {
    setCurrentStep("transferring");
    addLog("Transferring USDC on same chain...");

    try {
      // Ensure we're on the correct chain
      await switchToChain(sourceBlockchain);

      if (transactionId) {
        await updateTransactionRecord(transactionId, { status: 'transferring' });
      }

      const config = CHAIN_CONFIG[sourceBlockchain];
      
      const tx = await writeContractAsync({
        address: config.usdcAddress as `0x${string}`,
        abi: [
          {
            type: "function",
            name: "transfer",
            stateMutability: "nonpayable",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
          },
        ],
        functionName: "transfer",
        args: [destinationAddress as `0x${string}`, amount],
      });

      addLog(`Transfer Tx: ${tx}`);
      
      if (transactionId) {
        await updateTransactionRecord(transactionId, { 
          status: 'completed',
          burnTransactionId: tx
        });
      }
      
      setCurrentStep("completed");
      return tx;
    } catch (err) {
      setError("Same-chain transfer failed");
      if (transactionId) {
        await updateTransactionRecord(transactionId, { 
          status: 'failed',
          error: err instanceof Error ? err.message : 'Same-chain transfer failed'
        });
      }
      throw err;
    }
  };

  const executeRebalance = async (
    sourceBlockchain: Blockchain,
    destinationBlockchain: Blockchain,
    amount: string,
    destinationAddress: string,
    sourceUserWalletId?: string,
    destinationUserWalletId?: string,
  ) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    let transactionId: string | null = null;
    
    try {
      setCurrentStep("initiating");
      addLog("Starting rebalance process...");

      // Create transaction record if wallet IDs are provided
      if (sourceUserWalletId && destinationUserWalletId) {
        transactionId = await createTransactionRecord(
          sourceUserWalletId,
          destinationUserWalletId,
          amount,
          sourceBlockchain,
          destinationBlockchain
        );
      }

      const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);

      addLog(`Source: ${address} (${sourceBlockchain})`);
      addLog(`Destination: ${destinationAddress} (${destinationBlockchain})`);
      addLog(`Amount: ${amount} USDC`);

      // Check if it's a same-chain transfer
      const isSameChain = sourceBlockchain === destinationBlockchain;
      if (isSameChain) {
        addLog("Detected same-chain transfer, using direct USDC transfer...");
        
        // For same-chain transfers, we don't need destination address gas check
        const sourceBalance = await publicClient?.getBalance({
          address: address,
        });
        
        const minBalance = parseEther("0.01");
        if (!sourceBalance || sourceBalance < minBalance) {
          throw new Error("Insufficient native token for gas fees");
        }

        // Direct USDC transfer for same chain
        await transferSameChain(
          sourceBlockchain,
          numericAmount,
          destinationAddress,
          transactionId || undefined,
        );
        
        addLog("Same-chain transfer completed successfully!");
        return;
      }

      // Cross-chain transfer logic (existing CCTP flow)
      addLog("Detected cross-chain transfer, using CCTP...");
      
      // Check native balance for gas fees on current wallet
      const sourceBalance = await publicClient?.getBalance({
        address: address,
      });
      
      const minBalance = parseEther("0.01"); // 0.01 native token
      if (!sourceBalance || sourceBalance < minBalance) {
        throw new Error("Insufficient native token for gas fees");
      }

      await approveUSDC(sourceBlockchain, numericAmount, transactionId || undefined);
      const burnTx = await burnUSDC(
        sourceBlockchain,
        destinationBlockchain,
        numericAmount,
        destinationAddress,
        transactionId || undefined,
      );
      const attestation = await retrieveAttestation(burnTx, sourceBlockchain, transactionId || undefined);
      await mintUSDC(destinationBlockchain, attestation, transactionId || undefined);
      
      if (transactionId) {
        await updateTransactionRecord(transactionId, { status: 'completed' });
      }
      
      addLog("Cross-chain rebalance completed successfully!");
    } catch (error) {
      setCurrentStep("error");
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addLog(`Error: ${errorMessage}`);
      
      if (transactionId) {
        await updateTransactionRecord(transactionId, { 
          status: 'failed',
          error: errorMessage
        });
      }
    }
  };

  const reset = () => {
    setCurrentStep("idle");
    setLogs([]);
    setError(null);
    setCurrentTransactionId(null);
  };

  return {
    currentStep,
    logs,
    error,
    executeRebalance,
    getBalance,
    reset,
    isConnected,
    address,
  };
}