import { Handle, Position } from "reactflow";

export default function GraphNode({ data }: any) {
  return (
    <div className="px-4 py-2 bg-white rounded-xl shadow">
      <Handle type="target" position={Position.Top} />
      
      <div>{data.label}</div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}