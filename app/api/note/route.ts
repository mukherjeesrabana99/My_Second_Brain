import { prisma } from "@/lib/db";
import { getEmbedding } from "@/lib/rag/embedding";
import { cosineSimilarity } from "@/lib/rag/similarity";
import { NextRequest, NextResponse } from "next/server";

import { openai } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content required" },
        { status: 400 }
      );
    }

    // 🧠 1. Generate embedding
    const embedding = await getEmbedding(content);

    // 🤖 2. AI tags + category
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Extract:
1. Tags (max 5)
2. One category

Return JSON:
{
  "tags": [],
  "category": ""
}
`,
        },
        {
          role: "user",
          content,
        },
      ],
    });

    const aiText = aiRes.choices[0].message.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch {
      parsed = { tags: [], category: "General" };
    }

    const tags = parsed.tags || [];
    const category = parsed.category || "General";

    // 💾 3. Save note
    const note = await prisma.note.create({
      data: {
        content,
        embedding,
        tags,
        category,
      },
    });

    return NextResponse.json(note);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const notes = await prisma.note.findMany();
  return NextResponse.json(notes);
}
