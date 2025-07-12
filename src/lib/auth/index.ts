import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { headers } from "next/headers";
import { nextCookies } from "better-auth/next-js";
import { user, account, session, verification } from "@/db/schema";
 
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            user: user,
            account: account,
            session: session,
            verification: verification,
        }
    }),
    plugins: [nextCookies()],
    emailAndPassword: {  
        enabled: true
    },
});


