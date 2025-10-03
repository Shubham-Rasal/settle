import { Blockchain } from "./types"

export type Chain = keyof typeof mainnetChains | keyof typeof testnetChains;

interface ChainConfig {
  usdcAddress: string
  tokenMessengerAddress: string
  messageTransmitterAddress: string
  tokenMinterAddress: string
  messageAddress: string
  domain: number
  chainId: number
}

export const mainnetChains = {
  Arbitrum: {
    name: "Arbitrum",

    chainId: 42161,
  },
  Avalanche: {
    name: "Avalanche",

    chainId: 43114,
  },
  Base: {
    name: "Base",

    chainId: 8453,
  },
  Codex: {
    name: "Codex",

    chainId: 24443,
  },
  Ethereum: {
    name: "Ethereum",

    chainId: 1,
  },
  Linea: {
    name: "Linea",

    chainId: 59144,
  },
  Optimism: {
    name: "OP Mainnet",

    chainId: 10,
  },
  Polygon: {
    name: "Polygon PoS",

    chainId: 137,
  },
  Sei: {
    name: "Sei",

    chainId: 713715,
  },
  Solana: {
    name: "Solana",

    chainId: 1399811149,
  },
  Sonic: {
    name: "Sonic",

    chainId: 85431,
  },
  Unichain: {
    name: "Unichain",

    chainId: 1231,
  },
  World_Chain: {
    name: "World Chain",

    chainId: 91715,
  },
} as const;

export const testnetChains = {
  Arbitrum_Sepolia: {
    name: "Arbitrum Sepolia",

    chainId: 421614,
  },
  Avalanche_Fuji: {
    name: "Avalanche Fuji",

    chainId: 43113,
  },
  Base_Sepolia: {
    name: "Base Sepolia",

    chainId: 84532,
  },
  Codex_Testnet: {
    name: "Codex Testnet",

    chainId: 24442,
  },
  Ethereum_Sepolia: {
    name: "Ethereum Sepolia",

    chainId: 11155111,
  },
  Linea_Sepolia: {
    name: "Linea Sepolia",

    chainId: 11155111,
  },
  Optimism_Sepolia: {
    name: "OP Sepolia",

    chainId: 11155420,
  },
  Polygon_Amoy: {
    name: "Polygon PoS Amoy",

    chainId: 80002,
  },
  Sei_Testnet: {
    name: "Sei Testnet",

    chainId: 713714,
  },
  Solana_Devnet: {
    name: "Solana Devnet",

    chainId: 1399811148,
  },
  Sonic_Testnet: {
    name: "Sonic Testnet",

    chainId: 85430,
  },
  Unichain_Sepolia: {
    name: "Unichain Sepolia",

    chainId: 1230,
  },
  World_Chain_Sepolia: {
    name: "World Chain Sepolia",

    chainId: 91714,
  },
} as const;

export const CHAIN_CONFIG: Record<Blockchain, ChainConfig> = {
  // Mainnet chains
  [Blockchain.ETH]: {
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum Mainnet USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 0, // Ethereum domain ID
    chainId: 1,
  },
  [Blockchain.MATIC]: {
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon PoS USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 7, // Polygon PoS domain ID
    chainId: 137,
  },
  [Blockchain.ARB]: {
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 3, // Arbitrum domain ID
    chainId: 42161,
  },
  [Blockchain.BASE]: {
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 6, // Base domain ID
    chainId: 8453,
  },
  [Blockchain.AVAX]: {
    usdcAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // Avalanche C-Chain USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 1, // Avalanche domain ID
    chainId: 43114,
  },
  [Blockchain.OP]: {
    usdcAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // OP Mainnet USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 2, // Optimism domain ID
    chainId: 10,
  },
  [Blockchain.LINEA]: {
    usdcAddress: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", // Linea USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 11, // Linea domain ID
    chainId: 59144,
  },
  [Blockchain.SOL]: {
    usdcAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Solana USDC
    tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
    messageAddress: "0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78",
    domain: 5, // Solana domain ID
    chainId: 1399811149,
  },
  [Blockchain.ETH_SEPOLIA]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Ethereum Sepolia
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x80537e4e8bAb73D21096baa3a8c813b45CA0b7c9",
    domain: 0, // Ethereum Sepolia domain ID
    chainId: 11155111,
  },
  [Blockchain.MATIC_AMOY]: {
    usdcAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", // USDC on Polygon PoS Amoy
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 7, // Polygon PoS Amoy domain ID (same as mainnet)
    chainId: 80002,
  },
  [Blockchain.ARB_SEPOLIA]: {
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // USDC on Arbitrum Sepolia
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x70fAB9868cd54E12C7d87196424d6E0ca21be534",
    domain: 3, // Arbitrum Sepolia domain ID (same as mainnet)
    chainId: 421614,
    },
  [Blockchain.BASE_SEPOLIA]: {
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 6, // Base Sepolia domain ID (same as mainnet)
    chainId: 84532,
    },
  [Blockchain.AVAX_FUJI]: {
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65", // USDC on Avalanche Fuji
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    tokenMinterAddress: "0x4ED8867f9947A5fe140C9dC1c6f207F3489F501E",
    messageAddress: "0xeAf1DB5E3eb86FEbD8080368a956622b62Dcb78f",
    domain: 1, // Avalanche Fuji domain ID (same as mainnet)
    chainId: 43113,
    },
  [Blockchain.OP_SEPOLIA]: {
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // USDC on OP Sepolia
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0xffbeA106ce4A3CdAfcC82BAebeD78C81814e32Ed",
    domain: 2, // OP Sepolia domain ID (same as mainnet)
    chainId: 11155420,
    },
  [Blockchain.SOL_DEVNET]: {
    usdcAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC on Solana Devnet
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 5, // Solana Devnet domain ID (same as mainnet)
    chainId: 1399811148,
    },
  [Blockchain.SONIC_BLAZE]: {
    usdcAddress: "0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6", // USDC on Sonic Blaze
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 13, // Sonic Blaze domain ID (same as mainnet)
    chainId: 85430,
    },
  [Blockchain.LINEA_SEPOLIA]: {
    usdcAddress: "0xFEce4462D57bD51A6A552365A011b95f0E16d9B7", // USDC on Linea Sepolia
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 11, // Linea Sepolia domain ID (same as mainnet)
    chainId: 11155111,
    },
} 