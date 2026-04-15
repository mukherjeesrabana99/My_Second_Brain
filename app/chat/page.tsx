"use client";

import { useState } from "react";

export default function BrainChat() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!query.trim()) return;

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg space-y-4">
      <h2 className="text-xl font-semibold text-violet-700">
        Ask Your Brain 🧠
      </h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask something..."
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-violet-400"
      />

      <button
        onClick={ask}
        className="px-5 py-2 bg-violet-600 text-white rounded-xl"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {answer && (
        <div className="p-4 bg-violet-50 rounded-xl">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}