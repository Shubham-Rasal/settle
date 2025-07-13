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
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x80537e4e8bAb73D21096baa3a8c813b45CA0b7c9",
    domain: 0, // Ethereum Sepolia domain ID
  },
  [Blockchain.MATIC_AMOY]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Polygon Amoy
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 7, // Polygon PoS Amoy domain ID
  },
  [Blockchain.ARB_SEPOLIA]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Arbitrum Sepolia
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x70fAB9868cd54E12C7d87196424d6E0ca21be534",
    domain: 3, // Arbitrum Sepolia domain ID
  },
  [Blockchain.BASE_SEPOLIA]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Base Sepolia
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 6, // Base Sepolia domain ID
  },
  [Blockchain.AVAX_FUJI]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Avalanche Fuji
    tokenMessengerAddress: "0xeb08f243E5d3FCFF26A9E38Ae5520A669f4019d0",
    messageTransmitterAddress: "0xa9fB1b3009DCb79E2fe346c16a604B8Fa8aE0a79",
    tokenMinterAddress: "0x4ED8867f9947A5fe140C9dC1c6f207F3489F501E",
    messageAddress: "0xeAf1DB5E3eb86FEbD8080368a956622b62Dcb78f",
    domain: 1, // Avalanche Fuji domain ID
  },
  [Blockchain.OP_SEPOLIA]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on OP Sepolia
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0xffbeA106ce4A3CdAfcC82BAebeD78C81814e32Ed",
    domain: 2, // OP Sepolia domain ID
  },
  [Blockchain.SOL_DEVNET]: {
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Solana Devnet
    tokenMessengerAddress: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterAddress: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    tokenMinterAddress: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    messageAddress: "0x8E52a9e76148185536F0f0779749Cc895E5f70dC",
    domain: 1, // Solana Devnet domain ID
  },
} 