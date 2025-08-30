import { Blockchain } from "./types"

interface ChainConfig {
  usdcAddress: string
  tokenMessengerAddress: string
  messageTransmitterAddress: string
  tokenMinterAddress: string
  messageAddress: string
  domain: number
}

export const CHAIN_CONFIG: Record<Blockchain, ChainConfig> = {
  [Blockchain.ETH_SEPOLIA]: {
    usdcAddress: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238", // USDC on Sepolia (CCTP v2)
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa", // CCTP v2 Token Messenger
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275", // CCTP v2 Message Transmitter
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A", // Keep existing for compatibility
    messageAddress: "0x80537e4e8bAb73D21096baa3a8c813b45CA0b7c9", // Keep existing for compatibility
    domain: 0, // Ethereum Sepolia domain ID
  },
  [Blockchain.MATIC_AMOY]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Polygon Amoy (keeping original as no v2 mapping)
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5", // Keep original for Polygon
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD", // Keep original for Polygon
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 7, // Polygon PoS Amoy domain ID
  },
  [Blockchain.ARB_SEPOLIA]: {
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // USDC on Arbitrum Sepolia (CCTP v2)
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa", // CCTP v2 Token Messenger
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275", // CCTP v2 Message Transmitter
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A", // Keep existing for compatibility
    messageAddress: "0x70fAB9868cd54E12C7d87196424d6E0ca21be534", // Keep existing for compatibility
    domain: 3, // Arbitrum Sepolia domain ID
  },
  [Blockchain.BASE_SEPOLIA]: {
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia (CCTP v2)
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa", // CCTP v2 Token Messenger
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275", // CCTP v2 Message Transmitter
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A", // Keep existing for compatibility
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC", // Keep existing for compatibility
    domain: 6, // Base Sepolia domain ID
  },
  [Blockchain.AVAX_FUJI]: {
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65", // USDC on Avalanche Fuji (CCTP v2)
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa", // CCTP v2 Token Messenger
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275", // CCTP v2 Message Transmitter
    tokenMinterAddress: "0x4ED8867f9947A5fe140C9dC1c6f207F3489F501E", // Keep existing for compatibility
    messageAddress: "0xeAf1DB5E3eb86FEbD8080368a956622b62Dcb78f", // Keep existing for compatibility
    domain: 1, // Avalanche Fuji domain ID
  },
  [Blockchain.OP_SEPOLIA]: {
    usdcAddress: "0x5fd84259d66cd46123540766be93dfe6d43130d7", // USDC on OP Sepolia (keeping original as no v2 mapping)
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5", // Keep original for OP
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275", // Keep original for OP
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0xffbeA106ce4A3CdAfcC82BAebeD78C81814e32Ed",
    domain: 2, // OP Sepolia domain ID
  },
  [Blockchain.SOL_DEVNET]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Solana Devnet (keeping original as no v2 mapping)
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5", // Keep original for Solana
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD", // Keep original for Solana
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 1, // Solana Devnet domain ID
  },
  [Blockchain.SONIC_BLAZE]: {
    usdcAddress: "0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6", // USDC on Sonic Blaze (CCTP v2)
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa", // CCTP v2 Token Messenger
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275", // CCTP v2 Message Transmitter
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A", // Generic placeholder
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC", // Generic placeholder
    domain: 13, // Sonic Blaze domain ID
  },
  [Blockchain.LINEA_SEPOLIA]: {
    usdcAddress: "0xFEce4462D57bD51A6A552365A011b95f0E16d9B7", // USDC on Linea Sepolia (CCTP v2)
    tokenMessengerAddress: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa", // CCTP v2 Token Messenger
    messageTransmitterAddress: "0xe737e5cebeeba77efe34d4aa090756590b1ce275", // CCTP v2 Message Transmitter
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A", // Generic placeholder
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC", // Generic placeholder
    domain: 11, // Linea Sepolia domain ID
  },
} 