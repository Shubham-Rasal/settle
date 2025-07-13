export enum Blockchain {
  ETH_SEPOLIA = "ETH-SEPOLIA",
  MATIC_AMOY = "MATIC-AMOY",
  ARB_SEPOLIA = "ARB-SEPOLIA",
  BASE_SEPOLIA = "BASE-SEPOLIA",
  AVAX_FUJI = "AVAX-FUJI",
  OP_SEPOLIA = "OP-SEPOLIA",
  SOL_DEVNET = "SOL-DEVNET",
}

export const blockchainNames: Record<Blockchain, string> = {
  [Blockchain.ETH_SEPOLIA]: "Ethereum Sepolia",
  [Blockchain.MATIC_AMOY]: "Polygon Amoy",
  [Blockchain.ARB_SEPOLIA]: "Arbitrum Sepolia",
  [Blockchain.BASE_SEPOLIA]: "Base Sepolia",
  [Blockchain.AVAX_FUJI]: "Avalanche Fuji",
  [Blockchain.OP_SEPOLIA]: "Optimism Sepolia",
  [Blockchain.SOL_DEVNET]: "Solana Devnet",
};

export const blockchainLogos: Record<Blockchain, string> = {
  [Blockchain.ETH_SEPOLIA]: "/chains/ethereum.svg",
  [Blockchain.MATIC_AMOY]: "/chains/polygon.svg",
  [Blockchain.ARB_SEPOLIA]: "/chains/arbitrum.svg",
  [Blockchain.BASE_SEPOLIA]: "/chains/base.svg",
  [Blockchain.AVAX_FUJI]: "/chains/avalanche.svg",
  [Blockchain.OP_SEPOLIA]: "/chains/optimism.svg",
  [Blockchain.SOL_DEVNET]: "/chains/solana.svg",
};

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