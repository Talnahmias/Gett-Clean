import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cleaners = await prisma.cleaner.findMany({
    orderBy: { rating: "desc" },
  });
  return NextResponse.json(cleaners);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, isOnline } = body;

  if (!id || typeof isOnline !== "boolean") {
    return NextResponse.json({ error: "id and isOnline required" }, { status: 400 });
  }

  const cleaner = await prisma.cleaner.update({
    where: { id },
    data: { isOnline },
  });

  return NextResponse.json(cleaner);
}
