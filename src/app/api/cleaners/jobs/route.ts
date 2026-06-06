import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingInclude } from "@/lib/booking";

export async function GET(request: NextRequest) {
  const cleanerId = request.nextUrl.searchParams.get("cleanerId");
  if (!cleanerId) {
    return NextResponse.json({ error: "cleanerId required" }, { status: 400 });
  }

  const jobs = await prisma.booking.findMany({
    where: {
      OR: [
        { cleanerId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
        { cleanerId: null, status: "SEARCHING" },
      ],
    },
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}
