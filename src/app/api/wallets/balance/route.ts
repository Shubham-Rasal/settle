import { NextResponse } from 'next/server';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { wallet } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }

    // Verify wallet ownership
    const walletRecord = await db.query.wallet.findFirst({
      where: eq(wallet.id, walletId),
    });

    if (!walletRecord || walletRecord.userId !== session.user.id) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const response = await client.getWalletTokenBalance({
      id: walletId,
    });

    console.log("response", response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error getting wallet balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get wallet balance' },
      { status: 500 }
    );
  }
} 