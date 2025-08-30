import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { userWallet } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { Blockchain } from '@/lib/types';

interface CreateUserWalletRequest {
  name: string;
  address: string;
  blockchain: Blockchain;
  connectionType: 'metamask' | 'walletconnect';
  chainId?: string;
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user wallets from database
    const userWallets = await db.query.userWallet.findMany({
      where: and(
        eq(userWallet.userId, session.user.id),
        eq(userWallet.isActive, true)
      ),
      orderBy: (userWallet, { desc }) => [desc(userWallet.createdAt)],
    });

    return NextResponse.json(userWallets);
  } catch (error: any) {
    console.error('Error getting user wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user wallets' },
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

    const body: CreateUserWalletRequest = await req.json();
    const { name, address, blockchain, connectionType, chainId } = body;

    // Validate required fields
    if (!name || !address || !blockchain || !connectionType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, blockchain, connectionType' },
        { status: 400 }
      );
    }

    // Validate address format (basic validation)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // Check if wallet already exists for this user
    const existingWallet = await db.query.userWallet.findFirst({
      where: and(
        eq(userWallet.userId, session.user.id),
        eq(userWallet.address, address.toLowerCase()),
        eq(userWallet.blockchain, blockchain),
        eq(userWallet.isActive, true)
      ),
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: 'Wallet already exists for this address and blockchain' },
        { status: 409 }
      );
    }

    // Create new user wallet
    const newWallet = await db.insert(userWallet).values({
      userId: session.user.id,
      name: name.trim(),
      address: address.toLowerCase(),
      blockchain,
      connectionType,
      chainId,
      isActive: true,
    }).returning();

    return NextResponse.json(newWallet[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating user wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user wallet' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get('id');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Missing wallet ID' },
        { status: 400 }
      );
    }

    // Soft delete the wallet (set isActive to false)
    const updatedWallet = await db
      .update(userWallet)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userWallet.id, walletId),
          eq(userWallet.userId, session.user.id)
        )
      )
      .returning();

    if (updatedWallet.length === 0) {
      return NextResponse.json(
        { error: 'Wallet not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Wallet deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user wallet' },
      { status: 500 }
    );
  }
}