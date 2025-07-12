import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

export const db = drizzlePg(process.env.NEON_POSTGRES_URL!);