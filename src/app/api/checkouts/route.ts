import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { checkout, wallet } from '@/db/schema';
import { getSession } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';
import { Blockchain } from '@/lib/types';

// Mapping from checkout chain identifiers to Circle blockchain identifiers
const CHAIN_TO_BLOCKCHAIN: Record<string, Blockchain> = {
  'ethereum': Blockchain.ETH_SEPOLIA,
  'polygon': Blockchain.MATIC_AMOY,
  'arbitrum': Blockchain.ARB_SEPOLIA,
  'optimism': Blockchain.OP_SEPOLIA,
  'base': Blockchain.BASE_SEPOLIA,
  'avalanche': Blockchain.AVAX_FUJI,
  'solana': Blockchain.SOL_DEVNET,
};

// GET /api/checkouts - Fetch user's checkouts
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCheckouts = await db
      .select()
      .from(checkout)
      .where(eq(checkout.userId, session.user.id))
      .orderBy(checkout.createdAt);

    return NextResponse.json({ checkouts: userCheckouts });
  } catch (error) {
    console.error('Failed to fetch checkouts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/checkouts - Create new checkout
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, amount } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: 'Title and amount are required' }, { status: 400 });
    }

    // Generate unique slug and ID
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).substring(2, 8)}`;
    const id = Math.random().toString(36).substring(2, 10);
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/${slug}`;

    // Get user's Circle wallets for recipient addresses
    const userWallets = await db.query.wallet.findMany({
      where: eq(wallet.userId, session.user.id),
    });

    // Create recipient wallets mapping from user's Circle wallets
    const recipientWallets: Record<string, string> = {};
    
    // Map each supported chain to a corresponding wallet address
    for (const chainId of Object.keys(CHAIN_TO_BLOCKCHAIN)) {
      const blockchainId = CHAIN_TO_BLOCKCHAIN[chainId];
      const userWallet = userWallets.find(w => w.blockchain === blockchainId);
      
      if (userWallet) {
        recipientWallets[chainId] = userWallet.address;
      }
    }

    // If no wallets found, return an error
    if (Object.keys(recipientWallets).length === 0) {
      return NextResponse.json({ 
        error: 'No wallets found. Please create wallets first.' 
      }, { status: 400 });
    }

    const newCheckout = await db
      .insert(checkout)
      .values({
        id,
        userId: session.user.id,
        title,
        amount,
        url,
        slug,
        recipientWallets: recipientWallets,
        supportedChains: Object.keys(recipientWallets), // Only support chains where user has wallets
      })
      .returning();

    return NextResponse.json({ checkout: newCheckout[0] }, { status: 201 });
  } catch (error) {
    console.error('Failed to create checkout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}