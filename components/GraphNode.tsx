

export default function GraphNode({ data }: any) {
  return (
    <div className="px-5 py-3 bg-white rounded-2xl shadow-lg border border-violet-200">
      <div className="font-semibold text-violet-700">
        {data.label}
      </div>
    </div>
  );
}