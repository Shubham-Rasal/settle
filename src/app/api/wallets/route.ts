import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { wallet, userWallet } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

interface WalletResponse {
  id: string;
  name: string;
  blockchain: string;
  address: string;
  controlType: 'user' | 'developer';
  connectionType?: 'generated' | 'metamask';
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get developer-controlled wallets from database
    const developerWallets = await db.query.wallet.findMany({
      where: eq(wallet.userId, session.user.id),
      orderBy: (wallet, { desc }) => [desc(wallet.createdAt)],
    });

    // Get user-controlled wallets from database
    const userWallets = await db.query.userWallet.findMany({
      where: and(
        eq(userWallet.userId, session.user.id),
        eq(userWallet.isActive, true)
      ),
      orderBy: (userWallet, { desc }) => [desc(userWallet.createdAt)],
    });

    // Combine and format wallets
    const allWallets: WalletResponse[] = [
      ...developerWallets.map(w => ({
        id: w.id,
        name: w.name,
        blockchain: w.blockchain,
        address: w.address,
        controlType: 'developer' as const,
        connectionType: 'generated' as const,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
      ...userWallets.map(w => ({
        id: w.id,
        name: w.name,
        blockchain: w.blockchain,
        address: w.address,
        controlType: 'user' as const,
        connectionType: w.connectionType as 'metamask',
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }))
    ];

    // Sort by creation date (newest first)
    allWallets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(allWallets);
  } catch (error: any) {
    console.error('Error getting wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get wallets' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, address, blockchain, controlType, connectionType } = body;

    // If it's a user-controlled wallet, delegate to user-wallets endpoint
    if (controlType === 'user') {
      const userWalletData = {
        name,
        address,
        blockchain,
        connectionType: connectionType || 'metamask',
      };

      const newUserWallet = await db.insert(userWallet).values({
        userId: session.user.id,
        name: userWalletData.name.trim(),
        address: userWalletData.address.toLowerCase(),
        blockchain: userWalletData.blockchain,
        connectionType: userWalletData.connectionType,
        isActive: true,
      }).returning();

      return NextResponse.json({
        ...newUserWallet[0],
        controlType: 'user',
        connectionType: userWalletData.connectionType,
      }, { status: 201 });
    }

    // Handle developer-controlled wallet creation (existing logic)
    return NextResponse.json(
      { error: 'Developer wallet creation not implemented in this endpoint' },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet' },
      { status: 500 }
    );
  }
} 