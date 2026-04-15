"use client";

import { useEffect, useState } from "react";

type TagType = {
  tag: {
    id: string;
    name: string;
  };
};

type NoteType = {
  id: string;
  content: string;
  category?: {
    id: string;
    name: string;
  } | null;
  tags: TagType[];
};

export default function Dashboard() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<NoteType[]>([]);

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

  // 🧠 Group by category name
  const grouped = notes.reduce((acc: Record<string, NoteType[]>, note) => {
    const cat = note.category?.name || "General";

    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(note);

    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* 🔥 Header */}
        <h1 className="text-4xl font-bold text-violet-700">
          Second Brain 🧠
        </h1>

        {/* ✨ Input */}
        <div className="p-6 rounded-3xl bg-white shadow-xl border border-violet-100">
          <textarea
            placeholder="Write your thoughts..."
            className="w-full p-4 rounded-xl bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={saveNote}
            className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md hover:scale-105 transition"
          >
            Save Note ✨
          </button>
        </div>

        {/* 🧾 Category Sections */}
        {Object.keys(grouped).map((category) => (
          <div key={category} className="space-y-4">

            {/* 🏷 Category Title */}
            <h2 className="text-2xl font-semibold text-violet-600">
              {category}
            </h2>

            {/* 📄 Notes */}
            <div className="grid gap-4">
              {grouped[category].map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-white shadow-lg border border-violet-100 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-gray-800">{note.content}</p>

                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 🏷 Tags */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {note.tags.map((t) => (
                      <span
                        key={t.tag.id}
                        className="px-3 py-1 text-xs bg-violet-100 text-violet-600 rounded-full"
                      >
                        #{t.tag.name}
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