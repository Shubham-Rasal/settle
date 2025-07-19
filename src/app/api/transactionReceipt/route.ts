import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txHash = searchParams.get("txHash");

  const url = `https://eth-sepolia.g.alchemy.com/v2/oE0TIJ9A_G8oeKEuQGJ-H`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getTransactionReceipt",
      params: [txHash],
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
  }
}
