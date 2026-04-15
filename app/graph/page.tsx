"use client";

import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

import GraphNode from "@/components/GraphNode";
import ParticlesBg from "@/components/ParticlesBg";

export default function GraphPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/graph")
      .then((res) => res.json())
      .then((data) => {
        const nodes = data.notes.map((note: any, i: number) => ({
          id: note.id,
          type: "custom",
          data: { label: note.content.slice(0, 30) },
          position: {
            x: Math.cos(i) * 300,
            y: Math.sin(i) * 300,
          },
        }));

        const edges = data.connections.map((conn: any) => ({
          id: conn.id,
          source: conn.fromId,
          target: conn.toId,
          animated: true,
          label: conn.label,
          style: {
            stroke: "#6366f1",
            strokeWidth: 2,
          },
        }));

        setNodes(nodes);
        setEdges(edges);
      });
  }, []);

  return (
    <div className="h-screen relative">
    
      <ParticlesBg />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ custom: GraphNode }}
        fitView
      >
        <Background color="#555" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}