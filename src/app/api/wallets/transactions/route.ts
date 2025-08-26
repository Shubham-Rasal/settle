import { NextResponse } from "next/server"
import { db } from "@/db"
import { desc, eq } from "drizzle-orm"
import { rebalanceTransaction, checkoutTransaction, checkout } from "@/db/schema"
import { getSession } from "@/lib/auth/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Fetch rebalancing transactions
    const rebalanceTransactions = await db.query.rebalanceTransaction.findMany({
      where: eq(rebalanceTransaction.userId, session.user.id),
      orderBy: [desc(rebalanceTransaction.createdAt)],
    })

    // Fetch checkout transactions with checkout details
    const checkoutTransactions = await db
      .select({
        id: checkoutTransaction.id,
        checkoutId: checkoutTransaction.checkoutId,
        userId: checkoutTransaction.userId,
        amount: checkoutTransaction.amount,
        chain: checkoutTransaction.chain,
        recipientAddress: checkoutTransaction.recipientAddress,
        payerAddress: checkoutTransaction.payerAddress,
        transactionHash: checkoutTransaction.transactionHash,
        status: checkoutTransaction.status,
        createdAt: checkoutTransaction.createdAt,
        updatedAt: checkoutTransaction.updatedAt,
        checkoutTitle: checkout.title,
      })
      .from(checkoutTransaction)
      .leftJoin(checkout, eq(checkoutTransaction.checkoutId, checkout.id))
      .where(eq(checkoutTransaction.userId, session.user.id))
      .orderBy(desc(checkoutTransaction.createdAt))

    // Transform rebalancing transactions to include type
    const transformedRebalanceTransactions = rebalanceTransactions.map(tx => ({
      ...tx,
      type: 'rebalance' as const,
    }))

    // Transform checkout transactions to match the expected format
    const transformedCheckoutTransactions = checkoutTransactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      type: 'checkout' as const,
      amount: parseFloat(tx.amount) * 1_000_000, // Convert to smallest unit for consistency
      sourceChain: tx.chain,
      destinationChain: tx.chain, // Same chain for checkout deposits
      status: tx.status.toUpperCase(),
      transactionHash: tx.transactionHash,
      checkoutTitle: tx.checkoutTitle || 'Unknown Checkout',
      recipientAddress: tx.recipientAddress,
      payerAddress: tx.payerAddress,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
    }))

    // Combine and sort all transactions by creation date
    const allTransactions = [
      ...transformedRebalanceTransactions,
      ...transformedCheckoutTransactions,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(allTransactions)
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 