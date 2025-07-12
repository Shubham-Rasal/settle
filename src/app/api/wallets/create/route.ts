import { NextResponse } from 'next/server';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { wallet } from '@/db/schema';
import { Blockchain } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { walletSetId, blockchains, name } = await req.json();

    if (!walletSetId || !blockchains || !blockchains.length) {
      return NextResponse.json(
        { error: 'Wallet set ID and blockchains are required' },
        { status: 400 }
      );
    }

    // Validate blockchain values
    const invalidBlockchains = blockchains.filter(
      (chain: string) => !Object.values(Blockchain).includes(chain as Blockchain)
    );

    if (invalidBlockchains.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid blockchain(s) specified',
          invalidBlockchains,
          validBlockchains: Object.values(Blockchain)
        },
        { status: 400 }
      );
    }

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const response = await client.createWallets({
      blockchains: blockchains,
      count: 1,
      accountType: 'SCA', // Smart Contract Account for developer-controlled wallets
      walletSetId: walletSetId,
    });

    // Store wallet metadata in the database
    if (response.data?.wallets?.[0]) {
      await db.insert(wallet).values({
        id: response.data.wallets[0].id,
        userId: session.user.id,
        name: name,
        walletSetId: walletSetId,
        address: response.data.wallets[0].address,
        blockchain: blockchains[0] as Blockchain,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet' },
      { status: 500 }
    );
  }
} 