import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { user, account, session, verification, wallet, userWallet, walletSet, rebalanceSettings, rebalanceTransaction, checkout, checkoutTransaction } from "@/db/schema";

export const db = drizzlePg(process.env.NEON_POSTGRES_URL!,{
    schema: {
        user: user,
        account: account,
        session: session,
        verification: verification,
        wallet: wallet,
        userWallet: userWallet,
        walletSet: walletSet,
        rebalanceSettings: rebalanceSettings,
        rebalanceTransaction: rebalanceTransaction,
        checkout: checkout,
        checkoutTransaction: checkoutTransaction,
    }
});