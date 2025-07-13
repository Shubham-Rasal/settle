import { NextResponse } from "next/server"
import { db } from "@/db"
import { desc, eq } from "drizzle-orm"
import { rebalanceTransaction } from "@/db/schema"
import { getSession } from "@/lib/auth/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userTransactions = await db.query.rebalanceTransaction.findMany({
      where: eq(rebalanceTransaction.userId, session.user.id),
      orderBy: [desc(rebalanceTransaction.createdAt)],
    })

    return NextResponse.json(userTransactions)
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 