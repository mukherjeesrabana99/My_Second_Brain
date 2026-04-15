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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/graph")
      .then((res) => res.json())
      .then((data) => {

     
        const nodes = data.nodes.map((node: any, i: number) => ({
          id: node.id,
          data: {
            label: node.label,
            category: node.category,
          },

         
          position: {
            x: Math.cos((i / data.nodes.length) * 2 * Math.PI) * 400,
            y: Math.sin((i / data.nodes.length) * 2 * Math.PI) * 400,
          },
        }));

        const edges = data.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          animated: true,
        
          style: {
            stroke: edge.strength === 2 ? "#7c3aed" : "#a78bfa",
            strokeWidth: edge.strength === 2 ? 3 : 2,
          },
        }));

        setNodes(nodes);
        setEdges(edges);
      });
  }, []);
  console.log("NODES", nodes);
console.log("EDGES", edges)

const highlightedEdges = edges.map((e) => ({
  ...e,
  style: {
    ...e.style,
    opacity:
      selectedNode &&
      e.source !== selectedNode &&
      e.target !== selectedNode
        ? 0.1
        : 1,
  },
}));

const highlightedNodes = nodes.map((n) => ({
  ...n,
  style: {
    opacity:
      selectedNode &&
      !edges.some(
        (e) =>
          (e.source === selectedNode && e.target === n.id) ||
          (e.target === selectedNode && e.source === n.id)
      ) &&
      n.id !== selectedNode
        ? 0.2
        : 1,

    boxShadow:
      n.id === selectedNode
        ? "0 0 20px rgba(124,58,237,0.8)"
        : "none",
  },
}));
  return (
    <div className="h-screen relative bg-gradient-to-br from-white to-violet-50">

    
      <ParticlesBg />

      <ReactFlow
        nodes={highlightedNodes}
        edges={highlightedEdges}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        nodeTypes={{ custom: GraphNode }}
        fitView
      >

        <Background color="#e5e7eb" gap={24} />

        <Controls />

        <MiniMap
          nodeColor={(node) => {
            if (node.data?.category === "Web Development") return "#7c3aed";
            if (node.data?.category === "General") return "#a78bfa";
            return "#c4b5fd";
          }}
        />
      </ReactFlow>
    </div>
  );
}