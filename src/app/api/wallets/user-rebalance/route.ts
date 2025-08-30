import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { userRebalanceTransaction, userWallet } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';    

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      sourceUserWalletId,
      destinationUserWalletId,
      amount,
      sourceChain,
      destinationChain,
      status,
      error: errorMessage,
      approveTransactionId,
      burnTransactionId,
      mintTransactionId,
      messageBytes,
      messageHash,
      attestation
    } = body;

    // Validate required fields
    if (!sourceUserWalletId || !destinationUserWalletId || !amount || !sourceChain || !destinationChain || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify wallet ownership
    const [sourceWallet, destinationWallet] = await Promise.all([
      db
        .select()
        .from(userWallet)
        .where(eq(userWallet.id, sourceUserWalletId))
        .limit(1)
        .then(rows => rows[0]),
      db
        .select()
        .from(userWallet)
        .where(eq(userWallet.id, destinationUserWalletId))
        .limit(1)
        .then(rows => rows[0])
    ]);

    if (!sourceWallet || sourceWallet.userId !== session.user.id) {
      return NextResponse.json({ error: 'Source wallet not found' }, { status: 404 });
    }

    if (!destinationWallet || destinationWallet.userId !== session.user.id) {
      return NextResponse.json({ error: 'Destination wallet not found' }, { status: 404 });
    }

    // Convert amount to smallest unit (USDC has 6 decimals)
    const amountInSmallestUnit = Math.round(parseFloat(amount) * 1_000_000);

    // Create user rebalance transaction record
    const transactionId = uuidv4();
    const newTransaction = await db.insert(userRebalanceTransaction).values({
      id: transactionId,
      userId: session.user.id,
      sourceUserWalletId,
      destinationUserWalletId,
      amount: amountInSmallestUnit,
      sourceChain,
      destinationChain,
      status,
      error: errorMessage || null,
      approveTransactionId: approveTransactionId || null,
      burnTransactionId: burnTransactionId || null,
      mintTransactionId: mintTransactionId || null,
      messageBytes: messageBytes || null,
      messageHash: messageHash || null,
      attestation: attestation || null,
    }).returning();

    return NextResponse.json({
      success: true,
      transaction: newTransaction[0],
    });

  } catch (error: any) {
    console.error('Error creating user rebalance transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      transactionId,
      status,
      error: errorMessage,
      approveTransactionId,
      burnTransactionId,
      mintTransactionId,
      messageBytes,
      messageHash,
      attestation
    } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Transaction ID and status are required' },
        { status: 400 }
      );
    }

    // Verify transaction ownership
    const existingTransaction = await db
      .select()
      .from(userRebalanceTransaction)
      .where(eq(userRebalanceTransaction.id, transactionId))
      .limit(1)
      .then(rows => rows[0]);

    if (!existingTransaction || existingTransaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update transaction
    const updatedTransaction = await db
      .update(userRebalanceTransaction)
      .set({
        status,
        error: errorMessage || existingTransaction.error,
        approveTransactionId: approveTransactionId || existingTransaction.approveTransactionId,
        burnTransactionId: burnTransactionId || existingTransaction.burnTransactionId,
        mintTransactionId: mintTransactionId || existingTransaction.mintTransactionId,
        messageBytes: messageBytes || existingTransaction.messageBytes,
        messageHash: messageHash || existingTransaction.messageHash,
        attestation: attestation || existingTransaction.attestation,
        updatedAt: new Date(),
      })
      .where(eq(userRebalanceTransaction.id, transactionId))
      .returning();

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction[0],
    });

  } catch (error: any) {
    console.error('Error updating user rebalance transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}