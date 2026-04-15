import { prisma } from "@/lib/db";
import { groq } from "@/lib/ai/groq";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    const scored = notes.map((note) => {
      const text = note.content.toLowerCase();
      const q = query.toLowerCase();

      let score = 0;

      if (text.includes(q)) score += 5;

      note.tags.forEach((t) => {
        if (q.includes(t.tag.name)) score += 3;
      });

      if (note.category?.name && q.includes(note.category.name)) {
        score += 2;
      }

      return { note, score };
    });

    const topNotes = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.note);

    const context = topNotes
      .map((n, i) => `Note ${i + 1}: ${n.content}`)
      .join("\n");

    const aiRes = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a personal knowledge assistant.

Answer ONLY using the provided notes.
If answer not found, say "I don't have enough information."

Be concise and helpful.
`,
        },
        {
          role: "user",
          content: `
Question:
${query}

Notes:
${context}
`,
        },
      ],
    });

    const answer = aiRes.choices[0].message.content || "No response";

    return NextResponse.json({
      answer,
      notesUsed: topNotes,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
