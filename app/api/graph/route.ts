import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  // ✅ include relations
  const notes = await prisma.note.findMany({
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  const edges: any[] = [];

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const noteA = notes[i];
      const noteB = notes[j];

      // 🏷 Extract tag names
      const tagsA = noteA.tags.map((t) => t.tag.name);
      const tagsB = noteB.tags.map((t) => t.tag.name);

      // 🧠 Find common tags
      const commonTags = tagsA.filter((tag) =>
        tagsB.includes(tag)
      );

      // 🗂 Category match
      const sameCategory =
        noteA.category?.name &&
        noteA.category?.name === noteB.category?.name;

      // 🎯 Create edge if related
      if (commonTags.length > 0 || sameCategory) {
        edges.push({
          id: `${noteA.id}-${noteB.id}`,
          source: noteA.id,
          target: noteB.id,
          label:
            commonTags.length > 0
              ? `#${commonTags.join(", #")}`
              : `📁 ${noteA.category?.name}`,
        
          strength: commonTags.length > 0 ? 2 : 1,
        
          // ✅ ADD THIS
          type: commonTags.length > 0 ? "tag" : "category",
        });
      }
    }
  }

  return NextResponse.json({
    nodes: notes.map((n) => ({
      id: n.id,
      label: n.content.slice(0, 30),
      category: n.category?.name || "General",
    })),
    edges,
  });
}