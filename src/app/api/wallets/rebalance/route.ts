import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import { db } from "@/db";
import { rebalanceSettings, rebalanceTransaction, wallet } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { CHAIN_CONFIG } from "@/lib/chain-config";
import { Blockchain } from "@/lib/types";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import Web3 from "web3";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY!;
const CIRCLE_ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET!;

const web3 = new Web3("https://eth-sepolia.g.alchemy.com/v2/oE0TIJ9A_G8oeKEuQGJ-H");
// Get rebalance transactions
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const transactions = await db.query.rebalanceTransaction.findMany({
      where: eq(rebalanceTransaction.userId, session.user.id),
      orderBy: [desc(rebalanceTransaction.createdAt)],
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching rebalance transactions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Create new rebalance transaction
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sourceWalletId, amount } = await req.json();

    if (!sourceWalletId || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
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
    ]);

    if (!sourceWallet) {
      return new NextResponse("Source wallet not found", { status: 404 });
    }

    if (!treasuryWallet) {
      return new NextResponse("Treasury wallet not configured", {
        status: 400,
      });
    }

    // Get treasury wallet details
    const treasuryWalletDetails = await db.query.wallet.findFirst({
      where: eq(wallet.id, treasuryWallet.treasuryWalletId),
    });

    if (!treasuryWalletDetails) {
      return new NextResponse("Treasury wallet details not found", {
        status: 404,
      });
    }

    // Create a client
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: CIRCLE_API_KEY,
      entitySecret: CIRCLE_ENTITY_SECRET,
    });

    // Step 1: Approve USDC transfer
    const approveResponse = await client.createContractExecutionTransaction({
      walletId: sourceWallet.id,
      contractAddress:
        CHAIN_CONFIG[sourceWallet.blockchain as Blockchain].usdcAddress,
      abiFunctionSignature: "approve(address,uint256)",
      abiParameters: [
        CHAIN_CONFIG[sourceWallet.blockchain as Blockchain]
          .tokenMessengerAddress,
        amount.toString(),
      ],
      fee: {
        type: "level",
        config: {
          feeLevel: "HIGH",
        },
      },
    });

    if (!approveResponse.data?.id) {
      throw new Error("Failed to create approve transaction");
    }

    console.log(approveResponse.data);

    // Create initial transaction record
    const transaction = await db
      .insert(rebalanceTransaction)
      .values({
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
      })
      .returning();

    const encodedDestinationAddress = web3.eth.abi.encodeParameter(
      "address",
      treasuryWalletDetails.address
    );

    // step 2: deposit for burn
    const depositResponse = await client.createContractExecutionTransaction({
      walletId: sourceWallet.id,
      abiFunctionSignature: "depositForBurn(uint256,uint32,bytes32,address)",
      abiParameters: [
        amount.toString(),
        "7",
        encodedDestinationAddress,
        CHAIN_CONFIG[sourceWallet.blockchain as Blockchain].usdcAddress,
      ],
      contractAddress:
        CHAIN_CONFIG[sourceWallet.blockchain as Blockchain]
          .tokenMessengerAddress,
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM",
        },
      },
    });

    console.log(depositResponse.data);

    if (!depositResponse.data?.id) {
      throw new Error("Failed to create deposit transaction");
    }

    //update the burn transaction id
    await db
      .update(rebalanceTransaction)
      .set({
        burnTransactionId: depositResponse.data.id,
      })
      .where(eq(rebalanceTransaction.id, transaction[0].id));

    console.log("Deposit transaction created:", depositResponse.data.id);

    //get the transaction


    // let transactionResponse;
    // while (true) {
    //   transactionResponse = await client.getTransaction({
    //     id: depositResponse.data.id,
    //   });
    //   const state = transactionResponse.data?.transaction?.state;
    //   console.log(`Polling transaction state: ${state}`);
    //   if (state === "CONFIRMED") {
    //     console.log("Transaction confirmed, here's the hash", transactionResponse.data?.transaction?.txHash);
    //     break;
    //   }
    //   if (state === "FAILED") {
    //     throw new Error("Transaction failed");
    //   }
    //   // Wait for a few seconds before polling again
    //   await new Promise((resolve) => setTimeout(resolve, 5000));
    // }

    //sleep for 10 seconds

    // if (!transactionResponse.data?.transaction?.txHash) {
    //   throw new Error("Failed to get transaction");
    // }

    //get the message bytes
    // get messageBytes from EVM logs using txHash of the transaction.
    const transactionReceipt = await web3.eth.getTransactionReceipt(
      "0x804b7833e73dd1b210b3f2972ea55ffac8e06066cb380a29e73555b38d7133d1"
    );

    console.log("transactionReceipt", transactionReceipt);

    let messageHash = "";
    const eventTopic = web3.utils.keccak256("MessageSent(bytes)") as string;
    if (transactionReceipt.logs) {
      const log = transactionReceipt.logs.find(
        (l) => l.topics?.[0] === eventTopic
      );
      if (log && log.data) {
        const messageBytes = web3.eth.abi.decodeParameters(
          ["bytes"],
          log.data
        )[0] as string;
        messageHash = web3.utils.keccak256(messageBytes);
        console.log(messageHash);
      }
    }

    //sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000)); 

    //fetch attestation
    // Get attestation signature from iris-api.circle.com
    const attestationResponse = await fetch(
        `https://iris-api-sandbox.circle.com/attestations/${messageHash}`
      );
      const {messageBytes, attestation} = await attestationResponse.json();
      console.log(messageBytes, attestation);
    

    const mintResponse = await client.createContractExecutionTransaction({
        walletId: treasuryWallet.treasuryWalletId,
        abiFunctionSignature: 'receiveMessage(bytes,bytes)',
        abiParameters: [messageBytes, attestation],
        contractAddress: CHAIN_CONFIG[sourceWallet.blockchain as Blockchain].usdcAddress,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      });

    console.log(mintResponse.data);
    

    return NextResponse.json(transaction[0]);
  } catch (error: any) {
    console.error(
      "Error creating rebalance transaction:",
      error.response || error
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
