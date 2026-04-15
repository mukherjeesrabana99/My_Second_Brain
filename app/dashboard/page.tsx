"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  const fetchNotes = async () => {
    const res = await fetch("/api/note");
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const saveNote = async () => {
    if (!text.trim()) return;

    console.log("hi")

    await fetch("/api/note", {
      method: "POST",
      body: JSON.stringify({ content: text }),
    });

    setText("");
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/note/${id}`, {
      method: "DELETE",
    });

    fetchNotes();
  };
  const grouped = notes.reduce((acc: any, note: any) => {
    const cat = note.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(note);
    return acc;
  }, {});
  return (
    <div className="min-h-screen p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 🔥 Header */}
        <h1 className="text-3xl font-bold text-violet-700">
          Second Brain 🧠
        </h1>

        {/* ✨ Input Card */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-lg shadow-xl border border-white/40">
          <textarea
            placeholder="Write your thoughts..."
            className="w-full p-4 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={saveNote}
            className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg hover:scale-105"
          >
            Save Note ✨
          </button>
        </div>

        {/* 🧾 Notes List */}
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white/70 backdrop-blur-lg border border-white/40 shadow-lg flex justify-between items-center hover:scale-[1.02]"
            >
              <p className="text-gray-800">{note.content}</p>

              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {Object.keys(grouped).map((category) => (
  <div key={category}>
    <h2 className="text-xl font-semibold text-violet-600 mb-2">
      {category}
    </h2>

    <div className="space-y-3">
      {grouped[category].map((note: any) => (
        <div
          key={note.id}
          className="p-4 bg-white/70 rounded-xl shadow border"
        >
          <p>{note.content}</p>

          <div className="flex gap-2 mt-2 flex-wrap">
            {note.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-violet-100 text-violet-600 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
))}
      </div>
    </div>
  );
}