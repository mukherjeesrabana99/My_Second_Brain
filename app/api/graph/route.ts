import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const concepts = await prisma.concept.findMany();

  const relations = await prisma.relation.findMany();

  const nodes = concepts.map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const edges = relations.map((r) => ({
    id: r.id,
    source: r.fromId,
    target: r.toId,
    label: r.type,
  }));

  return NextResponse.json({ nodes, edges });
}