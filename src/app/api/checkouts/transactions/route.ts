import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { checkoutTransaction, checkout } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      checkoutId, 
      amount, 
      chain, 
      recipientAddress, 
      payerAddress, 
      transactionHash 
    } = body

    // Validate required fields
    if (!checkoutId || !amount || !chain || !recipientAddress || !transactionHash) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get the checkout to verify it exists and get the userId
    const checkoutData = await db.query.checkout.findFirst({
      where: eq(checkout.id, checkoutId),
    })

    if (!checkoutData) {
      return new NextResponse("Checkout not found", { status: 404 })
    }

    // Check if transaction already exists (prevent duplicates)
    const existingTransaction = await db.query.checkoutTransaction.findFirst({
      where: eq(checkoutTransaction.transactionHash, transactionHash),
    })

    if (existingTransaction) {
      return NextResponse.json(existingTransaction)
    }

    // Create the checkout transaction record
    const newTransaction = await db.insert(checkoutTransaction).values({
      id: Math.random().toString(36).substring(2, 10),
      checkoutId,
      userId: checkoutData.userId,
      amount,
      chain,
      recipientAddress,
      payerAddress,
      transactionHash,
      status: 'completed',
    }).returning()

    return NextResponse.json(newTransaction[0])
  } catch (error) {
    console.error("Failed to create checkout transaction:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}