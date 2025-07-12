# Settle

**Universal USDC Payment Gateway**

---

## Overview

Settle is a universal payment gateway that enables merchants to accept USDC payments from customers on multiple blockchains (starting with Ethereum and Arbitrum) and settle all funds on their preferred chain. It leverages Circle's Cross-Chain Transfer Protocol (CCTP V2) for secure, trust-minimized, and efficient cross-chain USDC transfers.

---

## Problem Statement

Crypto-native merchants face fragmented liquidity and complex user experiences when accepting USDC across multiple chains. Traditional bridges introduce trust risks and operational complexity. Settle solves this by providing a unified checkout and settlement experience, abstracting away the complexity of cross-chain payments.

---

## Key Features

- **Multi-Chain Acceptance:** Accept USDC payments from customers on Ethereum and Arbitrum (expandable to more chains).
- **Single-Chain Settlement:** All merchant funds are consolidated on the preferred chain using CCTP V2 (burn-and-mint, no third-party liquidity).
- **Seamless Checkout:** Embeddable Next.js checkout UI for easy integration, wallet connection (Wagmi/MetaMask), and Circle API interaction.
- **Admin Dashboard:** Merchants can view payments, balances by chain, and trigger treasury rebalancing (cross-chain USDC movement).
- **Security & Efficiency:** No third-party bridges or liquidity pools; all cross-chain transfers use Circle's CCTP V2.
- **Developer Friendly:** Simple API and UI components for integration.

---

## How It Works

### 1. Customer Checkout

- Customer visits merchant's site and initiates a USDC payment.
- Connects their wallet (MetaMask, etc.) on Ethereum or Arbitrum.
- Selects chain and confirms payment amount.
- Receives a unique deposit address (generated via Circle Payment Intents API).
- Sends USDC to the address; payment is detected and confirmed via Circle's API/webhooks.

### 2. Merchant Settlement

- All received USDC is credited to the merchant.
- If payment arrives on a non-preferred chain, Settle bridges the funds using CCTP V2:
  - **Burn:** USDC is burned on the source chain.
  - **Attestation:** Circle provides a signed attestation.
  - **Mint:** USDC is minted on the destination (preferred) chain.
- Merchant always receives consolidated funds on their chosen chain.

### 3. Admin Dashboard

- Merchants log in to view:
  - All payments (amount, chain, status, timestamp, tx hash).
  - USDC balances by chain.
  - Rebalance controls to move funds between chains.
- Rebalancing is triggered via the dashboard and executed by the backend using CCTP.

---

## System Architecture

- **Frontend:** Next.js + React, Wagmi for wallet connection, embeddable checkout component.
- **Backend:** Next.js API routes, Node.js, Circle SDK for payment and CCTP integration.
- **Database:** Drizzle ORM with Postgres (for payment and wallet tracking).
- **Circle Integration:** Uses Circle Payment Intents API and CCTP V2 for cross-chain transfers.
- **Wallets:** Customer uses their own wallet; merchant's system wallet is used for bridging.

---

## Supported Chains

- **MVP:** Ethereum, Arbitrum
- **Planned:** Expandable to other USDC-supported chains (e.g., Base, Optimism, Avalanche, Solana)

---

## Security

- Private keys for merchant wallets are securely managed (environment variables, never exposed to frontend).
- All cross-chain transfers are trust-minimized via Circle's CCTP (no third-party bridges).

---

## Getting Started

### Prerequisites

- Node.js, pnpm/yarn/npm
- Circle account and API key (sandbox or production)
- RPC endpoints for supported chains

### Setup

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd settle/admin
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   yarn install
   # or
   npm install
   ```

3. **Configure environment variables:**
   - `CIRCLE_API_KEY`
   - `CIRCLE_ENTITY_SECRET`
   - `NEON_POSTGRES_URL` (or your Postgres connection string)
   - RPC URLs for Ethereum/Arbitrum

4. **Run the development server:**
   ```bash
   pnpm dev
   # or
   yarn dev
   # or
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Usage

- **Checkout Integration:** Embed the checkout component/page in your store. Customers can pay in USDC on supported chains.
- **Admin Dashboard:** Log in to view payments, balances, and manage rebalancing.
- **Rebalancing:** Use the dashboard to move USDC between chains as needed.

---

## Roadmap

- Add support for more chains (Base, Optimism, Avalanche, Solana, etc.)
- Auto-rebalancing and advanced treasury management
- Enhanced analytics and reporting
- Programmable wallets and advanced merchant controls

---

## License

MIT

---

## References

- [Circle Developer Docs](https://developers.circle.com/)
- [CCTP V2 Overview](https://www.circle.com/en/cross-chain-transfer-protocol)
- [Next.js Documentation](https://nextjs.org/docs/)
