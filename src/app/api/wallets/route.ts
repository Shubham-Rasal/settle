import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { wallet } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get wallets from database
    const wallets = await db.query.wallet.findMany({
      where: eq(wallet.userId, session.user.id),
      orderBy: (wallet, { desc }) => [desc(wallet.createdAt)],
    });

    // Get balances for each wallet
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const balanceResponse = await client.getWalletTokenBalance({
            id: wallet.id,
          });

          return {
            ...wallet,
            balances: balanceResponse.data?.tokenBalances || [],
          };
        } catch (error) {
          console.error(`Failed to get balance for wallet ${wallet.id}:`, error);
          return {
            ...wallet,
            balances: [],
          };
        }
      })
    );

    return NextResponse.json(walletsWithBalances);
  } catch (error: any) {
    console.error('Error getting wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get wallets' },
      { status: 500 }
    );
  }
} 