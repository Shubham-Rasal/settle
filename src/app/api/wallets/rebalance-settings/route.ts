import { NextResponse } from "next/server"
import { db } from "@/db"
import { rebalanceSettings, wallet } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getSession } from "@/lib/auth/server"
import { getFeatureFlags } from "@/lib/feature-flags"

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await db.query.rebalanceSettings.findFirst({
      where: eq(rebalanceSettings.userId, session.user.id)
    })

    return NextResponse.json(settings || null)
  } catch (error) {
    console.error("Error fetching rebalance settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const featureFlags = getFeatureFlags()
    
    const body = await req.json()
    const {
      treasuryWalletId,
      autoRebalance,
      rebalanceMode,
      targetBalancePercentage,
      minRebalanceAmount
    } = body

    // Override autoRebalance to false if feature flag is disabled
    const finalAutoRebalance = autoRebalance && featureFlags.autoRebalancing

    if (!treasuryWalletId) {
      return new NextResponse("Treasury wallet ID is required", { status: 400 })
    }

    // Validate treasury wallet belongs to user
    const treasuryWallet = await db.query.wallet.findFirst({
      where: and(
        eq(wallet.id, treasuryWalletId),
        eq(wallet.userId, session.user.id)
      )
    })

    if (!treasuryWallet) {
      return new NextResponse("Treasury wallet not found", { status: 404 })
    }

    // Update or create rebalance settings
    const existingSettings = await db.query.rebalanceSettings.findFirst({
      where: eq(rebalanceSettings.userId, session.user.id)
    })

    if (existingSettings) {
      await db
        .update(rebalanceSettings)
        .set({
          treasuryWalletId,
          autoRebalance: finalAutoRebalance,
          rebalanceMode,
          targetBalancePercentage,
          minRebalanceAmount,
          updatedAt: new Date()
        })
        .where(eq(rebalanceSettings.id, existingSettings.id))
    } else {
      await db.insert(rebalanceSettings).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        treasuryWalletId,
        autoRebalance: finalAutoRebalance,
        rebalanceMode,
        targetBalancePercentage,
        minRebalanceAmount,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving rebalance settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 