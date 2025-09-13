"use client";

import { BridgingKit } from "@circle-fin/bridging-kit";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";   
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function BridgeKitTestPage() {
    const { isConnected } = useAccount();

 
  

  return (
    <div>
      <h1>BridgeKit Test</h1>
      {isConnected ? (
        <div>

      <Button
        onClick={async () =>
          {
            const adapter = await createAdapterFromProvider({
                provider: window.ethereum as any,
                chain: "Ethereum_Sepolia",    
              });
            const kit = new BridgingKit();
          kit.bridge({
            from: { adapter: adapter, chain: "Ethereum_Sepolia" },
            to: {
              adapter: adapter,
              chain: "Base_Sepolia",
            },
            amount: "1.0",
            config: { transferSpeed: "FAST" },
          })
        }}
      >
        Bridge
      </Button>
      </div>
      ) : (
        <div>Please connect your wallet

            <ConnectButton />
        </div>
      )}
    </div>
  );
}
