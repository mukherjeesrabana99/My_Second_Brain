import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { content } = body;

  const updated = await prisma.note.update({
    where: { id: params.id },
    data: { content },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.note.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}