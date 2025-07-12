PRD for Multichain USDC Checkout Using Circle CCTP V2

Multichain USDC Checkout System – PRD
Problem Statement
Blockchain ecosystems are siloed: assets on one chain (e.g. Ethereum) cannot be natively spent on another (e.g. Arbitrum) without bridging. Traditional bridges often lock USDC in third-party contracts or pools, introducing trust risks and tying up liquidity
developers.circle.com
. Crypto-native merchants today lack a unified checkout: they must either accept USDC only on a single chain or rely on complex bridges. We need a checkout system that accepts USDC on multiple chains and settles on the merchant’s preferred chain, using Circle’s CCTP V2 to handle the cross-chain transfers in a trust-minimized way (burn-and-mint). This reduces complexity for both merchants and customers, unifying liquidity across chains.
Goals and Non-Goals
Goals:
Multi-Chain Acceptance: Allow customers to pay in USDC on at least Ethereum and Arbitrum (two chains for MVP).
Single-Chain Settlement: Ensure merchants ultimately receive all USDC on their preferred chain (e.g. always on Ethereum), using CCTP V2 for cross-chain transfers.
Simple Integration: Provide a Next.js-based embeddable checkout UI that connects to customers’ wallets (via Wagmi/MetaMask) and calls Circle APIs.
Admin Dashboard: Offer merchants a dashboard to view payments by chain, payment status, and to trigger treasury rebalancing (moving USDC across chains via CCTP).
Security & Efficiency: Use native burn-and-mint (CCTP) so no third-party liquidity is needed
circle.com
, and aim for the fastest settlement (CCTP V2 Fast Transfers when possible).
Non-Goals:
No Additional Currencies: We focus only on USDC (currency code USD) and on-chain crypto payments. We do not support other stablecoins or fiat.
No Other Bridges: CCTP V2 is the only cross-chain mechanism. We do not implement legacy bridges, liquidity pools or multi-hop swaps.
No Credit-Card Payments (MVP): Only on-chain payments (no Web2 payment gateways) for crypto-native MVP.
No Onboarding: We assume users already hold USDC and have a compatible wallet; we do not handle KYC or fiat purchase.
Limited Chains Initially: MVP will cover Ethereum and Arbitrum only (expandable later). We do not support all USDC chains immediately.
User Stories
Merchant: “As a crypto-savvy merchant, I want to accept USDC from customers on either Ethereum or Arbitrum but receive all funds on my chosen chain, so I can simplify accounting.”
Customer: “As a customer, I want to pay for a purchase in USDC using the chain I’m on (Ethereum or Arbitrum) without worrying about bridge complexity.”
Merchant/Admin: “As a merchant’s admin, I want a dashboard to see each payment’s details (amount, chain, status) and to move USDC between chains if balances are uneven.”
Developer/Integrator: “As a developer building a store, I want a ready-made Next.js checkout component that handles wallet connection and calls Circle’s API for payments.”
System Architecture
The system uses a Next.js full-stack app: React+Wagmi frontend and Node.js API routes. In the example flow above, a user deposits USDC on one chain (Ethereum) and the system burns it to mint on another (Base); our solution is analogous for Ethereum⇆Arbitrum. Key components:
Frontend (Next.js + React): A checkout page connects to the user’s wallet via the Wagmi library (e.g. MetaMask)
circle.com
. The user selects or confirms payment in USDC on a supported chain. The UI displays a Circle-generated deposit address and amount (with QR code or copyable address) after creating a payment intent.
Backend/API (Next.js API routes): When checkout is initiated, the backend calls Circle’s Payment Intents API to create a payment intent. The request includes { amount, currency: USD, settlementCurrency: USD, paymentMethods: [{type: "blockchain", chain: "ETH" or "ARB"}] } as per Circle docs
developers.circle.com
. The API responds with a payment intent ID, and (via webhook or polling) eventually provides the blockchain deposit address
developers.circle.com
. The backend exposes endpoints like /api/create-payment-intent and /api/confirm-payment that the frontend invokes.
Circle Payment Integration: Using the @circle-fin/circle-sdk (or direct HTTP calls) on the server, we handle: creation of payment intents, retrieval of deposit addresses, and verification of received payments. For example, after creating an intent, we either subscribe to Circle’s webhooks or poll GET /v1/paymentIntents/{id} until paymentMethods.address is set
developers.circle.com
. Once the user sends USDC to that address, we poll or receive a webhook that updates the intent’s status to “completed.” (This matches Circle’s documented flow
developers.circle.com
developers.circle.com
.)
CCTP Interaction (Bridging): If a payment arrives on a chain that is not the merchant’s preferred chain, the system must bridge it using CCTP V2. The server (or an off-chain service) holds a merchant-controlled Ethereum and Arbitrum wallet (private key in env). When rebalancing is triggered, the backend calls the CCTP on-chain contracts: it invokes the burn function on the source chain’s USDC contract, then waits for Circle’s attestation. Once signed attestation is fetched, the backend calls the mint on the destination chain USDC contract
developers.circle.com
circle.com
. CCTP’s “Fast Transfer” mode (if both chains support it) can settle in seconds
developers.circle.com
; otherwise, it falls back to standard transfer (~13–19 minutes wait for finality
developers.circle.com
). The admin dashboard initiates these transactions, but the heavy lifting (calling Circle’s attestation API and smart contracts) is handled by our Node.js code using a library like ethers.js.
Data Storage: The system logs each payment intent and status in a database (or Next.js in-memory store for MVP) so the admin dashboard can display payment history and chain balances. If a database is out of scope, the backend can simply rely on Circle’s records and in-memory tracking for MVP (refetching payment intents as needed).
Wallet Handling: The customer uses their own wallet (via Wagmi/MetaMask) to send USDC. The merchant’s “system wallet” is needed only for bridging transactions: these can be executed on-chain by a server-side wallet. (We may use Circle’s Developer Wallets/Accounts via API, but since we settle on-chain, a standard EOA with gas is fine.)
Feature Breakdown
Checkout Flow
Wallet Connection: Frontend uses Wagmi to prompt the customer to connect their Ethereum/Arbitrum wallet
circle.com
. We restrict to supporting wallets (e.g. MetaMask on ETH/ARB networks).
Order Entry: The merchant’s site embeds our checkout component or page. Customer sees order details in USD and the option to pay in USDC. They confirm the amount and select chain (ETH or ARB).
Payment Intent Creation: On “Pay with USDC” click, the frontend calls the backend to create a payment intent (POST /v1/paymentIntents) with the chosen chain
developers.circle.com
. The backend returns a unique deposit address and intent ID.
Payment Submission: The UI displays the address and required amount. The customer sends the exact USDC (Ethereum-ERC20 or Arbitrum-ERC20) to that address.
Confirmation: The customer clicks “Confirm Payment” (or the system auto-polls). The frontend calls the backend /confirm-payment with the intent ID. The backend checks Circle’s API: if the on-chain transfer of the specified USDC amount to that address is observed, the payment intent is marked as paid. The frontend then shows success. (This follows the sample flow in Circle’s tutorial
circle.com
.)
Data Recording: Upon successful payment, we record the payment (intent ID, chain, amount) in our system for the merchant. The merchant is immediately credited (in the sense that funds are in Circle/our control), even if cross-chain settlement is pending.
Admin Dashboard
Login/Access: Merchants log in via a simple credential (or API key) to view the dashboard (MVP can skip complex auth).
Payments List: The dashboard lists all payments: columns include Payment ID, Amount, Chain (where paid), Status (pending/complete), Timestamp, and any on-chain Tx hash if available. The data comes from our records and Circle’s Payment Intents API.
Balances: Show current USDC balance held by the system on each chain (tracked via on-chain queries or Circle’s API). This helps merchants see how much needs rebalancing.
Rebalance Action: Merchants can select an amount of USDC and source/destination chain to transfer. Clicking “Rebalance” triggers the CCTP flow: the backend burns USDC on the source chain and, upon attestation, mints it on the destination chain. The dashboard shows status/progress (e.g. “Burn transaction pending… Done, minting… Completed”).
Notifications: Optionally, email or on-screen alerts when funds are received or when rebalancing completes.
Rebalancing (Treasury)
Trigger: The merchant can manually initiate a cross-chain transfer of USDC (rebalancing) via the admin UI. Alternatively, we could auto-balance (e.g. top-up a threshold) in future versions.
CCTP Fast Transfer: By default, use CCTP V2 Fast Transfer (supported on Ethereum↔Arbitrum) to minimize wait time
developers.circle.com
. This burns and mints instantly (seconds). If for any reason fast transfer isn’t possible (e.g. insufficient fast-allowance), fall back to CCTP Standard (waiting ~15 min for finality
developers.circle.com
).
Steps (Backend): On rebalancing command, our Node.js code executes:
Burn: Call the CCTP burn function on the source chain’s USDC contract (e.g. CircleBurnableERC20.burn).
Attestation: Wait for Circle’s off-chain attestation service to sign the burn event (the backend polls Circle’s attestation API or listens via their SDK).
Mint: With the signed attestation, call the CCTP mint function on the destination chain to mint the same USDC amount for the merchant wallet.
Completion: Once minted, funds appear in the merchant’s wallet on that chain. Dashboard updates reflect the new balances. The merchant now has consolidated USDC on their chosen chain, ready for use or withdrawal.
Circle API Interactions
Payment Intents API: We use Circle’s Payment Intents endpoints (see [Create a Payment Intent]
developers.circle.com
). Example request (JSON):
json
Copy
Edit
{
  "idempotencyKey": "<UUID>",
  "amount": {"amount": "10.00", "currency": "USD"},
  "settlementCurrency": "USD",
  "paymentMethods": [{"type": "blockchain", "chain": "ETH"}]
}
This reserves a payment intent for 10 USDC on Ethereum
developers.circle.com
. For Arbitrum, we’d use "chain": "ARB" (per Circle’s API reference
developers.circle.com
).
Deposit Address Retrieval: Circle does not immediately return a deposit address. We must either subscribe to Circle’s webhooks or poll the intent endpoint until paymentMethods[0].address appears
developers.circle.com
. Our backend will handle this: once address is set, we relay it to the frontend.
Payment Confirmation: After the user sends USDC, we call Circle’s API (e.g. GET /v1/paymentIntents/{id}) or use webhooks to see that amountPaid == amount and the timeline shows completed. This confirms receipt.
Circle SDK/Libs: We will likely use Circle’s official Node SDK (@circle-fin/circle-sdk) in our Next.js API routes
circle.com
 to simplify requests. The SDK supports calling these endpoints with our API key.
Optional – Circle Wallets: If desired, we could integrate Circle’s Programmable Wallets API so that merchants have a managed on-chain wallet; this is optional. For MVP, we handle on-chain directly.
Attestation API: For CCTP, Circle’s backend service signs the burn event. We will use Circle’s Attestation API (part of CCTP V2) to fetch the signed message that we then feed into the mint call
developers.circle.com
circle.com
. Circle’s docs cover this process.
Assumptions, Constraints, and Risks
Supported Chains: We assume CCTP V2 supports Ethereum and Arbitrum for both standard and fast transfer. (Indeed, Circle lists Arbitrum in CCTP V2 support
developers.circle.com
.) We assume chain codes “ETH” and “ARB” as per API
developers.circle.com
.
USDC Availability: Customers must hold USDC (ERC-20) on Ethereum or Arbitrum. They must also have the native gas (ETH) to pay for transactions. We do not handle gas payments or native tokens.
Circle Attestation Dependence: Bridging relies on Circle’s attestation service. If it is down or compromised, a burn could occur without a valid mint (funds effectively “lost” until service resumes). This single point of trust is a risk
proposals.infinex.xyz
. (Circle notes this risk; mitigation could include alternative bridges or insurance in future.)
Block Finality Delays: Standard transfers take ~13–19 minutes on Ethereum/Arbitrum
developers.circle.com
. We mitigate by using Fast Transfer in V2 (seconds) whenever possible, but merchants should expect some delay if fast-allowance is depleted.
Smart Contract Reliance: We assume Circle’s CCTP contracts on each chain remain stable. Any updates to CCTP would require front-end upgrades.
Next.js Constraint: The entire stack is Next.js. This means using API routes for backend logic. We assume this is acceptable for MVP scale; heavy scaling might need a dedicated server later.
Security: We must securely manage any private keys (e.g. for merchant’s on-chain wallet used for bridging). Keys will be stored in environment variables and never exposed to frontend.
Non-Functional: We assume sufficient infrastructure for Next.js, and that merchants have or can obtain a Circle account/sandbox API key for USDC.
Implementation Roadmap
Setup Environment: Create a Next.js project with wagmi and @circle-fin/circle-sdk installed
circle.com
. Configure Circle sandbox keys and Ethereum/Arbitrum RPC endpoints.
Wallet Connect: Implement wallet connection UI using Wagmi (MetaMask)
circle.com
. Ensure users can connect on ETH and ARB networks.
PaymentIntent Integration: Build API route to call Circle’s POST /paymentIntents. On checkout, generate an intent for the chosen chain
developers.circle.com
. Test that creating an intent returns a pending status.
Address Retrieval: Implement webhook handler or polling for paymentMethods.address
developers.circle.com
. Once address arrives, return it to frontend to display.
Payment Confirmation: Build API route to check intent status. After user sends USDC (by signing from their wallet), call Circle’s API to confirm. Display success to user when amountPaid == amount.
Admin Dashboard: Develop a protected Next.js page. It fetches all payment intents/payments from backend and Circle. Display them in a table with filters by chain and status.
Rebalancing Logic: Add UI controls on the dashboard: inputs for amount and target chain. Hook to backend API that initiates CCTP. In backend, write logic to call CCTP contracts: burn and then mint with attestation
developers.circle.com
. Use ethers.js for on-chain calls.
Testing: Test full flow on testnets (e.g. Ethereum Goerli and Arbitrum Goerli). Use Circle’s sandbox API and test USDC faucets. Verify cross-chain payments and rebalancing.
Monitoring & Logging: Ensure all API calls (Circle and on-chain) have error handling. Log transaction hashes and any errors. Provide meaningful errors to the merchant (e.g. “Transfer failed – see logs”).
Iterate and Harden: Based on testing, refine UX (e.g. show spinner during waits), add security checks, and prepare for mainnet deployment.
Each step should be well-documented, with code organized for extensibility (e.g. easily adding more chains later). The result will be a clear, maintainable Next.js codebase with end-to-end USDC checkout and CCTP bridging. Sources: We rely on Circle’s developer guides and docs for payment and CCTP flows
developers.circle.com
developers.circle.com
developers.circle.com
developers.circle.com
, as well as Circle tutorials on Next.js integration
circle.com
. The risk around attestation downtime is noted in community docs
proposals.infinex.xyz
.`