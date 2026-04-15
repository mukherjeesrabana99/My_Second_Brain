import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const notes = await prisma.note.findMany();

const edges = [];

for (let i = 0; i < notes.length; i++) {
  for (let j = i + 1; j < notes.length; j++) {
    const commonTags = notes[i].tags.filter((tag) =>
      notes[j].tags.includes(tag)
    );

    if (commonTags.length > 0) {
      edges.push({
        id: `${notes[i].id}-${notes[j].id}`,
        source: notes[i].id,
        target: notes[j].id,
        label: commonTags.join(", "),
      });
    }
  }
}

return NextResponse.json({ notes, connections: edges });
}