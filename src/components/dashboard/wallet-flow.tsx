import { useMemo } from 'react'
import ReactFlow, {
  Background,
  Handle,
  Position,
  Node,
  Edge,
  ConnectionMode,
  Controls,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Badge } from '@/components/ui/badge'

interface Wallet {
  id: string
  name: string
  blockchain: string
  address: string
}

interface WalletFlowProps {
  wallets: Wallet[]
  treasuryWalletId: string | null
}

const NODE_WIDTH = 280
const NODE_HEIGHT = 80
const VERTICAL_SPACING = 200
const HORIZONTAL_SPACING = 20

function WalletNode({ data }: { data: { wallet: Wallet; isTreasury: boolean } }) {
  const { wallet, isTreasury } = data
  
  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-card border ${isTreasury ? 'border-primary' : 'border-border'}`}>
      <div className="flex items-center gap-2">
        <div className="font-medium truncate">
          {wallet.name}
          {isTreasury && <span className="ml-2 text-primary">(Treasury)</span>}
        </div>
        <Badge>
            {wallet.blockchain}
        </Badge>
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground truncate">
        {wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4)}
      </div>
      {!isTreasury && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-muted-foreground"
        />
      )}
      {isTreasury && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-primary"
        />
      )}
    </div>
  )
}

export function WalletFlow({ wallets, treasuryWalletId }: WalletFlowProps) {
  const nodeTypes = useMemo(() => ({ wallet: WalletNode }), [])

  const { nodes, edges } = useMemo(() => {
    if (!treasuryWalletId) {
      return { nodes: [], edges: [] }
    }

    const treasuryWallet = wallets.find(w => w.id === treasuryWalletId)
    const otherWallets = wallets.filter(w => w.id !== treasuryWalletId)

    if (!treasuryWallet) {
      return { nodes: [], edges: [] }
    }

    // Calculate total width needed for all wallets
    const totalWidth = otherWallets.length * (NODE_WIDTH + HORIZONTAL_SPACING)
    const startX = -totalWidth / 2 + NODE_WIDTH / 2

    const nodes: Node[] = [
      // Treasury wallet at the bottom
      {
        id: treasuryWallet.id,
        type: 'wallet',
        position: { x: 0, y: VERTICAL_SPACING },
        data: { wallet: treasuryWallet, isTreasury: true },
      },
      // Other wallets in a row at the top
      ...otherWallets.map((wallet, index) => ({
        id: wallet.id,
        type: 'wallet',
        position: {
          x: startX + index * (NODE_WIDTH + HORIZONTAL_SPACING),
          y: 0,
        },
        data: { wallet, isTreasury: false },
      })),
    ]

    // Create edges from each wallet to the treasury
    const edges: Edge[] = otherWallets.map(wallet => ({
      id: `${wallet.id}-${treasuryWallet.id}`,
      source: wallet.id,
      target: treasuryWallet.id,
      animated: true,
      style: { stroke: 'white', strokeWidth: 2 },
    }))

    return { nodes, edges }
  }, [wallets, treasuryWalletId])

  if (!treasuryWalletId) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">Select a treasury wallet to visualize the flow</p>
      </div>
    )
  }

  return (
    <div className="h-[400px] bg-muted/50 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.5,
          maxZoom: 1,
        }}
        minZoom={0.5}
        maxZoom={1.5}
        
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background color="hsl(var(--muted-foreground))" />
      </ReactFlow>
    </div>
  )
} 