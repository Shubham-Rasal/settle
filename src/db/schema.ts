import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
					id: text('id').primaryKey(),
					name: text('name').notNull(),
 email: text('email').notNull().unique(),
 emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
 image: text('image'),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
				});

export const session = pgTable("session", {
					id: text('id').primaryKey(),
					expiresAt: timestamp('expires_at').notNull(),
 token: text('token').notNull().unique(),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull(),
 ipAddress: text('ip_address'),
 userAgent: text('user_agent'),
 userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
				});

export const account = pgTable("account", {
					id: text('id').primaryKey(),
					accountId: text('account_id').notNull(),
 providerId: text('provider_id').notNull(),
 userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
 accessToken: text('access_token'),
 refreshToken: text('refresh_token'),
 idToken: text('id_token'),
 accessTokenExpiresAt: timestamp('access_token_expires_at'),
 refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
 scope: text('scope'),
 password: text('password'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull()
				});

export const verification = pgTable("verification", {
					id: text('id').primaryKey(),
					identifier: text('identifier').notNull(),
 value: text('value').notNull(),
 expiresAt: timestamp('expires_at').notNull(),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
				});

export const wallet = pgTable("wallet", {
  id: text('id').primaryKey(), // Circle wallet ID
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  walletSetId: text('wallet_set_id').notNull(),
  address: text('address').notNull(),
  blockchain: text('blockchain').notNull(), // e.g., 'ethereum', 'arbitrum', etc.
  controlType: text('control_type').$default(() => 'developer').notNull(), // 'developer' or 'user'
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const userWallet = pgTable("user_wallet", {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: text('address').notNull(),
  blockchain: text('blockchain').notNull(), // e.g., 'ETH-SEPOLIA', 'ARB-SEPOLIA', etc.
  connectionType: text('connection_type').notNull(), // 'metamask', 'walletconnect', etc.
  chainId: text('chain_id'), // MetaMask chain ID (e.g., '0xaa36a7')
  isActive: boolean('is_active').$default(() => true).notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const walletSet = pgTable("wallet_set", {
  id: text('id').primaryKey(), // Circle wallet set ID
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const rebalanceSettings = pgTable("rebalance_settings", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  treasuryWalletId: text('treasury_wallet_id').notNull().references(() => wallet.id, { onDelete: 'cascade' }),
  autoRebalance: boolean('auto_rebalance').$default(() => false).notNull(),
  rebalanceMode: text('rebalance_mode').$default(() => 'gas_free').notNull(), // 'gas_free' or 'fast'
  targetBalancePercentage: integer('target_balance_percentage').$default(() => 100).notNull(), // percentage to maintain in each wallet
  minRebalanceAmount: integer('min_rebalance_amount').$default(() => 100).notNull(), // minimum amount to trigger rebalance in USD
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const rebalanceTransaction = pgTable("rebalance_transaction", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sourceWalletId: text('source_wallet_id').notNull().references(() => wallet.id, { onDelete: 'cascade' }),
  treasuryWalletId: text('treasury_wallet_id').notNull().references(() => wallet.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Amount in smallest unit (e.g., 1000000 for 1 USDC)
  sourceChain: text('source_chain').notNull(),
  destinationChain: text('destination_chain').notNull(),
  status: text('status').notNull(), // 'pending', 'approving', 'burning', 'attesting', 'minting', 'completed', 'failed'
  error: text('error'),
  approveTransactionId: text('approve_transaction_id'),
  burnTransactionId: text('burn_transaction_id'),
  mintTransactionId: text('mint_transaction_id'),
  messageBytes: text('message_bytes'),
  messageHash: text('message_hash'),
  attestation: text('attestation'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const checkout = pgTable("checkout", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  amount: text('amount').notNull(), // Store as string to preserve decimal precision
  url: text('url').notNull().unique(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  status: text('status').$default(() => 'active').notNull(), // 'active', 'disabled', 'deleted'
  supportedChains: jsonb('supported_chains').$default(() => ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 'solana']).notNull(), // Array of supported blockchain identifiers
  recipientWallets: jsonb('recipient_wallets').notNull(), // JSON object mapping chain -> wallet address
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const checkoutTransaction = pgTable("checkout_transaction", {
  id: text('id').primaryKey(),
  checkoutId: text('checkout_id').notNull().references(() => checkout.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  amount: text('amount').notNull(), // Store as string to preserve decimal precision
  chain: text('chain').notNull(), // The blockchain where payment was made
  recipientAddress: text('recipient_address').notNull(), // Address that received the payment
  payerAddress: text('payer_address'), // Address that made the payment (optional, may be unknown)
  transactionHash: text('transaction_hash').notNull(), // On-chain transaction hash
  status: text('status').$default(() => 'completed').notNull(), // 'completed', 'pending', 'failed'
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const userRebalanceTransaction = pgTable("user_rebalance_transaction", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sourceUserWalletId: text('source_user_wallet_id').notNull().references(() => userWallet.id, { onDelete: 'cascade' }),
  destinationUserWalletId: text('destination_user_wallet_id').notNull().references(() => userWallet.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Amount in smallest unit (e.g., 1000000 for 1 USDC)
  sourceChain: text('source_chain').notNull(),
  destinationChain: text('destination_chain').notNull(),
  status: text('status').notNull(), // 'pending', 'approving', 'burning', 'attesting', 'minting', 'completed', 'failed'
  error: text('error'),
  approveTransactionId: text('approve_transaction_id'),
  burnTransactionId: text('burn_transaction_id'),
  mintTransactionId: text('mint_transaction_id'),
  messageBytes: text('message_bytes'),
  messageHash: text('message_hash'),
  attestation: text('attestation'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  wallets: many(wallet),
  userWallets: many(userWallet),
  walletSets: many(walletSet),
}));

export const walletRelations = relations(wallet, ({ one }) => ({
  user: one(user, {
    fields: [wallet.userId],
    references: [user.id],
  }),
}));

export const userWalletRelations = relations(userWallet, ({ one }) => ({
  user: one(user, {
    fields: [userWallet.userId],
    references: [user.id],
  }),
}));

export const walletSetRelations = relations(walletSet, ({ one }) => ({
  user: one(user, {
    fields: [walletSet.userId],
    references: [user.id],
  }),
}));

export const checkoutRelations = relations(checkout, ({ many }) => ({
  transactions: many(checkoutTransaction),
}));

export const checkoutTransactionRelations = relations(checkoutTransaction, ({ one }) => ({
  checkout: one(checkout, {
    fields: [checkoutTransaction.checkoutId],
    references: [checkout.id],
  }),
  user: one(user, {
    fields: [checkoutTransaction.userId],
    references: [user.id],
  }),
}));

export const userRebalanceTransactionRelations = relations(userRebalanceTransaction, ({ one }) => ({
  user: one(user, {
    fields: [userRebalanceTransaction.userId],
    references: [user.id],
  }),
  sourceUserWallet: one(userWallet, {
    fields: [userRebalanceTransaction.sourceUserWalletId],
    references: [userWallet.id],
  }),
  destinationUserWallet: one(userWallet, {
    fields: [userRebalanceTransaction.destinationUserWalletId],
    references: [userWallet.id],
  }),
}));
