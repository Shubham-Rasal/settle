import { NextResponse } from 'next/server';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { walletSet } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const response = await client.createWalletSet({
      name: name,
    });

    // Store wallet set in the database
    await db.insert(walletSet).values({
      id: response.data?.walletSet?.id!,
      userId: session.user.id,
      name: name,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating wallet set:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet set' },
      { status: 500 }
    );
  }
} 