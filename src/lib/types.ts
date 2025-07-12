export enum Blockchain {
  ETH_SEPOLIA = "ETH-SEPOLIA",
  MATIC_AMOY = "MATIC-AMOY",
  SOL_DEVNET = "SOL-DEVNET",
  ARB_SEPOLIA = "ARB-SEPOLIA",
}

export const blockchainNames: Record<Blockchain, string> = {
  [Blockchain.ETH_SEPOLIA]: "Ethereum Sepolia",
  [Blockchain.MATIC_AMOY]: "Polygon Amoy",
  [Blockchain.SOL_DEVNET]: "Solana Devnet",
  [Blockchain.ARB_SEPOLIA]: "Arbitrum Sepolia",
}

export const blockchainLogos: Record<Blockchain, string> = {
  [Blockchain.ETH_SEPOLIA]: "/chains/ethereum.svg",
  [Blockchain.MATIC_AMOY]: "/chains/polygon.svg",
  [Blockchain.SOL_DEVNET]: "/chains/solana.svg",
  [Blockchain.ARB_SEPOLIA]: "/chains/arbitrum.svg",
}

export interface WalletSet {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  name: string;
  userId: string;
  walletSetId: string;
  address: string;
  blockchain: Blockchain;
  createdAt: Date;
  updatedAt: Date;
} 