import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { user, account, session, verification, wallet, walletSet, rebalanceSettings, rebalanceTransaction } from "@/db/schema";

export const db = drizzlePg(process.env.NEON_POSTGRES_URL!,{
    schema: {
        user: user,
        account: account,
        session: session,
        verification: verification,
        wallet: wallet,
        walletSet: walletSet,
        rebalanceSettings: rebalanceSettings,
        rebalanceTransaction: rebalanceTransaction,

    }
});