import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/server"
import { db } from "@/db"
import { rebalanceSettings, rebalanceTransaction, wallet } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { CHAIN_CONFIG } from "@/lib/chain-config"
import { Blockchain } from "@/lib/types"
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets"
import Web3 from 'web3'
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY!
const CIRCLE_ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET!

const web3 = new Web3()
// Get rebalance transactions
export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const transactions = await db.query.rebalanceTransaction.findMany({
      where: eq(rebalanceTransaction.userId, session.user.id),
      orderBy: [desc(rebalanceTransaction.createdAt)],
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching rebalance transactions:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Create new rebalance transaction
export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { sourceWalletId, amount } = await req.json()

    if (!sourceWalletId || !amount) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const [sourceWallet, treasuryWallet] = await Promise.all([
      db.query.wallet.findFirst({
        where: and(
          eq(wallet.id, sourceWalletId),
          eq(wallet.userId, session.user.id)
        ),
      }),
      db.query.rebalanceSettings.findFirst({
        where: eq(rebalanceSettings.userId, session.user.id),
      }),
    ])

    if (!sourceWallet) {
      return new NextResponse("Source wallet not found", { status: 404 })
    }

    if (!treasuryWallet) {
      return new NextResponse("Treasury wallet not configured", { status: 400 })
    }

    // Get treasury wallet details
    const treasuryWalletDetails = await db.query.wallet.findFirst({
      where: eq(wallet.id, treasuryWallet.treasuryWalletId),
    })

    if (!treasuryWalletDetails) {
      return new NextResponse("Treasury wallet details not found", { status: 404 })
    }

    // Create a client
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: CIRCLE_API_KEY,
      entitySecret: CIRCLE_ENTITY_SECRET,
    })

    // Step 1: Approve USDC transfer
    const approveResponse = await client.createContractExecutionTransaction({
      walletId: sourceWallet.id,
      contractAddress: CHAIN_CONFIG[sourceWallet.blockchain as Blockchain].usdcAddress,
      abiFunctionSignature: "approve(address,uint256)",
      abiParameters: [
        CHAIN_CONFIG[sourceWallet.blockchain as Blockchain].tokenMessengerAddress,
        amount.toString(),
      ],
      fee: {
        type: "level",
        config: {
          feeLevel: "HIGH",
        },
      },
    })

    if (!approveResponse.data?.id) {
      throw new Error("Failed to create approve transaction")
    }

    console.log(approveResponse.data)

    // Create initial transaction record
    const transaction = await db.insert(rebalanceTransaction).values({
      id: uuidv4(),
      userId: session.user.id,
      sourceWalletId: sourceWallet.id,
      treasuryWalletId: treasuryWallet.treasuryWalletId,
      amount: amount,
      sourceChain: sourceWallet.blockchain,
      destinationChain: treasuryWallet.rebalanceMode,
      status: "APPROVING",
      approveTransactionId: approveResponse.data.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    const encodedDestinationAddress = web3.eth.abi.encodeParameter(
      "address",
      treasuryWalletDetails.address
    );

    // step 2: deposit for burn
    const depositResponse = await client.createContractExecutionTransaction({
        walletId: sourceWallet.id,
        abiFunctionSignature: 'depositForBurn(uint256,uint32,bytes32,address)',
        abiParameters: [
          amount.toString(),
          "7",
          encodedDestinationAddress,
          CHAIN_CONFIG[sourceWallet.blockchain as Blockchain].usdcAddress
        ],
        contractAddress: CHAIN_CONFIG[sourceWallet.blockchain as Blockchain].tokenMessengerAddress,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      });

    console.log(depositResponse.data)


    

    return NextResponse.json(transaction[0])
  } catch (error: any) {
    console.error("Error creating rebalance transaction:", error.response || error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

