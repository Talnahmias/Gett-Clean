import { NextRequest, NextResponse } from "next/server";
import { bookingInclude, processExpiredOffers } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await processExpiredOffers();
  const cleanerId = request.nextUrl.searchParams.get("cleanerId");
  if (!cleanerId) {
    return NextResponse.json({ error: "cleanerId required" }, { status: 400 });
  }

  const jobs = await prisma.booking.findMany({
    where: {
      OR: [
        {
          cleanerId,
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
        {
          offeredCleanerId: cleanerId,
          status: "OFFERED",
        },
        {
          cleanerId: null,
          status: "SEARCHING",
          mode: "SCHEDULED",
        },
      ],
    },
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  });

  const completed = await prisma.booking.findMany({
    where: { cleanerId, status: "COMPLETED" },
    select: { price: true, tip: true },
  });

  const earnings = completed.reduce((sum, b) => sum + b.price + b.tip, 0);

  return NextResponse.json({ jobs, earnings, completedCount: completed.length });
}
