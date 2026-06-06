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

  const cleaner = await prisma.cleaner.findUnique({ where: { id } });
  if (!cleaner) {
    return NextResponse.json({ error: "Cleaner not found" }, { status: 404 });
  }

  if (cleaner.verificationStatus !== "VERIFIED" && isOnline) {
    return NextResponse.json(
      { error: "Only verified cleaners can go online" },
      { status: 403 },
    );
  }

  const updated = await prisma.cleaner.update({
    where: { id },
    data: { isOnline },
  });

  return NextResponse.json(updated);
}
