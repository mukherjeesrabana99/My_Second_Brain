export default function GraphNode({ data }: any) {
  return (
    <div className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-lg border border-violet-200 shadow-md hover:shadow-violet-300 hover:scale-110 transition">
      <p className="text-sm font-medium text-violet-700">
        {data.label}
      </p>
    </div>
  );
}