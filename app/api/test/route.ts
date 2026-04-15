import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const note = await prisma.note.create({
    data: {
      content: "Hello from Prisma and Next.js!",
    },
  });

  return NextResponse.json(note);
}