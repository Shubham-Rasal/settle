export enum Blockchain {
  // Mainnet chains
  ETH = "ETH",
  MATIC = "MATIC",
  ARB = "ARB",
  BASE = "BASE",
  AVAX = "AVAX",
  OP = "OP",
  SOL = "SOL",
  LINEA = "LINEA",
  
  // Testnet chains
  ETH_SEPOLIA = "ETH-SEPOLIA",
  MATIC_AMOY = "MATIC-AMOY",
  ARB_SEPOLIA = "ARB-SEPOLIA",
  BASE_SEPOLIA = "BASE-SEPOLIA",
  AVAX_FUJI = "AVAX-FUJI",
  OP_SEPOLIA = "OP-SEPOLIA",
  SOL_DEVNET = "SOL-DEVNET",
  SONIC_BLAZE = "SONIC-BLAZE",
  LINEA_SEPOLIA = "LINEA-SEPOLIA",
}

export const blockchainNames: Record<Blockchain, string> = {
  // Mainnet chains
  [Blockchain.ETH]: "Ethereum",
  [Blockchain.MATIC]: "Polygon",
  [Blockchain.ARB]: "Arbitrum",
  [Blockchain.BASE]: "Base",
  [Blockchain.AVAX]: "Avalanche",
  [Blockchain.OP]: "Optimism",
  [Blockchain.SOL]: "Solana",
  [Blockchain.LINEA]: "Linea",
  
  // Testnet chains
  [Blockchain.ETH_SEPOLIA]: "Ethereum Sepolia",
  [Blockchain.MATIC_AMOY]: "Polygon Amoy",
  [Blockchain.ARB_SEPOLIA]: "Arbitrum Sepolia",
  [Blockchain.BASE_SEPOLIA]: "Base Sepolia",
  [Blockchain.AVAX_FUJI]: "Avalanche Fuji",
  [Blockchain.OP_SEPOLIA]: "Optimism Sepolia",
  [Blockchain.SOL_DEVNET]: "Solana Devnet",
  [Blockchain.SONIC_BLAZE]: "Sonic Blaze",
  [Blockchain.LINEA_SEPOLIA]: "Linea Sepolia",
};

export const blockchainLogos: Record<Blockchain, string> = {
  // Mainnet chains
  [Blockchain.ETH]: "/chains/ethereum.svg",
  [Blockchain.MATIC]: "/chains/polygon.svg",
  [Blockchain.ARB]: "/chains/arbitrum.svg",
  [Blockchain.BASE]: "/chains/base.svg",
  [Blockchain.AVAX]: "/chains/avalanche.svg",
  [Blockchain.OP]: "/chains/optimism.svg",
  [Blockchain.SOL]: "/chains/solana.svg",
  [Blockchain.LINEA]: "/chains/linea.svg",
  
  // Testnet chains
  [Blockchain.ETH_SEPOLIA]: "/chains/ethereum.svg",
  [Blockchain.MATIC_AMOY]: "/chains/polygon.svg",
  [Blockchain.ARB_SEPOLIA]: "/chains/arbitrum.svg",
  [Blockchain.BASE_SEPOLIA]: "/chains/base.svg",
  [Blockchain.AVAX_FUJI]: "/chains/avalanche.svg",
  [Blockchain.OP_SEPOLIA]: "/chains/optimism.svg",
  [Blockchain.SOL_DEVNET]: "/chains/solana.svg",
  [Blockchain.SONIC_BLAZE]: "/chains/sonic.svg",
  [Blockchain.LINEA_SEPOLIA]: "/chains/linea.svg",
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