import { groq } from "@/lib/ai/groq";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const aiRes = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `
Extract knowledge graph from text.

Rules:
- Concepts = nouns / important terms
- Keep them SHORT (1-2 words)
- Normalize (React.js → React)

Return STRICT JSON:
{
  "concepts": [],
  "relations": [
    { "from": "", "to": "", "type": "" }
  ]
}
`,
        },
        {
          role: "user",
          content,
        },
      ],
    });

    let parsed;
    try {
      parsed = JSON.parse(aiRes.choices[0].message.content || "{}");
    } catch {
      parsed = { concepts: [], relations: [] };
    }

    const concepts: string[] = parsed.concepts || [];
    const relations = parsed.relations || [];

   
    const note = await prisma.note.create({
      data: { content },
    });

    
    const conceptMap: Record<string, string> = {};

    for (const c of concepts) {
      const name = c.trim().toLowerCase();

      if (!name) continue;

      const concept = await prisma.concept.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      conceptMap[name] = concept.id;

      await prisma.noteConcept.create({
        data: {
          noteId: note.id,
          conceptId: concept.id,
        },
      });
    }

   
    for (const r of relations) {
      const from = r.from?.toLowerCase().trim();
      const to = r.to?.toLowerCase().trim();
      const type = r.type?.toLowerCase().trim() || "related";

      if (!from || !to) continue;
      if (!conceptMap[from] || !conceptMap[to]) continue;

      await prisma.relation.upsert({
        where: {
          fromId_toId_type: {
            fromId: conceptMap[from],
            toId: conceptMap[to],
            type,
          },
        },
        update: {},
        create: {
          fromId: conceptMap[from],
          toId: conceptMap[to],
          type,
        },
      });
    }

    return NextResponse.json({ note });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}


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
