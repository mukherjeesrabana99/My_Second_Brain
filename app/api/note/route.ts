import { groq } from "@/lib/ai/groq";
import { prisma } from "@/lib/db";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const existingNotes = await prisma.note.findMany({
      select: { category: true },
    });

    const existingCategories = [
      ...new Set(existingNotes.map((n) => n.category).filter(Boolean)),
    ];

    const aiRes = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `
You are a smart note classification system.

Your job:
1. Extract 3-5 short tags
2. Assign ONE category

CRITICAL RULES:
- You MUST reuse existing categories if relevant
- DO NOT create new categories unnecessarily
- Similar meanings MUST map to SAME category

Examples:
- "hi", "hello", "hey" → category: "General"
- React, Next.js → category: "Web Development"

Existing categories:
${existingCategories.join(", ") || "None"}

If no suitable category exists, create a new one.

Return ONLY valid JSON:
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

  
    const note = await prisma.note.create({
      data: {
        content,

        tags,
        category,
      },
    });

    return NextResponse.json(note);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const notes = await prisma.note.findMany();
  return NextResponse.json(notes);
}
