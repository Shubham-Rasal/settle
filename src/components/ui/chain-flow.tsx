'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import ReactFlow, {
  Background,
  Handle,
  Position,
  Node,
  Edge,
  ConnectionMode,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Chain node component
function ChainNode({ data }: { data: { name: string; logo: string } }) {
  return (
    <div className="px-4 py-3 shadow-md rounded-lg bg-card border border-border backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 relative">
          <Image src={data.logo} alt={data.name} fill className="object-contain" />
        </div>
        <div className="font-medium">{data.name}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary"
      />
    </div>
  );
}

export function ChainFlow() {
  const nodeTypes = useMemo(() => ({ chain: ChainNode }), []);

  const nodes: Node[] = useMemo(() => [
    {
      id: 'ethereum',
      type: 'chain',
      position: { x: 0, y: 0 },
      data: { name: 'Ethereum', logo: '/chains/ethereum.svg' },
    },
    {
      id: 'arbitrum',
      type: 'chain',
      position: { x: 300, y: 0 },
      data: { name: 'Arbitrum', logo: '/chains/arbitrum.svg' },
    },
    {
      id: 'optimism',
      type: 'chain',
      position: { x: 0, y: 200 },
      data: { name: 'Optimism', logo: '/chains/optimism.svg' },
    },
    {
      id: 'base',
      type: 'chain',
      position: { x: 300, y: 200 },
      data: { name: 'Base', logo: '/chains/base.svg' },
    },
    {
      id: 'settle',
      type: 'chain',
      position: { x: 150, y: 100 },
      data: { name: 'Settle', logo: '/logo.png' },
    },
  ], []);

  const edges: Edge[] = useMemo(() => [
    {
      id: 'eth-settle',
      source: 'ethereum',
      target: 'settle',
      animated: true,
      style: { stroke: 'white', strokeWidth: 2 },
    },
    {
      id: 'arb-settle',
      source: 'arbitrum',
      target: 'settle',
      animated: true,
      style: { stroke: 'white', strokeWidth: 2 },
    },
    {
      id: 'settle-op',
      source: 'settle',
      target: 'optimism',
      animated: true,
      style: { stroke: 'white', strokeWidth: 2 },
    },
    {
      id: 'settle-base',
      source: 'settle',
      target: 'base',
      animated: true,
      style: { stroke: 'white', strokeWidth: 2 },
    },
  ], []);

  return (
    <div className="w-full h-full overflow-hidden pointer-events-none select-none">
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
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
      >
        {/* <Controls /> */}
        {/* <Background color="hsl(var(--muted-foreground))" /> */}
      </ReactFlow>
    </div>
  );
} 