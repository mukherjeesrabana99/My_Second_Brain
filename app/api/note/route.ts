import { groq } from "@/lib/ai/groq";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

    // 🧠 1. Get existing categories
    const existingCategoriesData = await prisma.category.findMany({
      select: { name: true },
    });

    const existingCategories = existingCategoriesData.map((c) => c.name);

    // 🤖 2. AI classification
    const aiRes = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a smart note classification system.

Your job:
1. Extract 3-5 short tags (lowercase, single words)
2. Assign ONE category

CRITICAL RULES:
- Reuse existing categories if relevant
- Do NOT create new categories unnecessarily
- Similar meanings MUST map to SAME category

Examples:
- "hi", "hello" → General
- React, Next.js → Web Development

Existing categories:
${existingCategories.join(", ") || "None"}

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

    // 🛡️ Safe JSON parsing
    const cleaned = aiText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { tags: [], category: "General" };
    }

    const tags: string[] = parsed.tags || [];
    const categoryName: string =
      parsed.category?.trim() || "General";

    // 🗂️ 3. Find or create category
    let category = await prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName },
      });
    }

    // 📝 4. Create note
    const note = await prisma.note.create({
      data: {
        content,
        categoryId: category.id,
      },
    });

    // 🏷️ 5. Handle tags (many-to-many)
    for (const tagName of tags) {
      const cleanTag = tagName.toLowerCase().trim();

      if (!cleanTag) continue;

      let tag = await prisma.tag.findUnique({
        where: { name: cleanTag },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: cleanTag },
        });
      }

      await prisma.noteTag.create({
        data: {
          noteId: note.id,
          tagId: tag.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// 📥 GET with relations
export async function GET() {
  const notes = await prisma.note.findMany({
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(notes);
}