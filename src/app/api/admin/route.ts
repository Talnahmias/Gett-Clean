import { NextResponse } from "next/server";
import { bookingInclude, processExpiredOffers } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await processExpiredOffers();

  const [cleaners, bookings, stats] = await Promise.all([
    prisma.cleaner.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const pendingCleaners = cleaners.filter((c) => c.verificationStatus === "PENDING");
  const activeBookings = bookings.filter(
    (b) => !["COMPLETED", "CANCELLED"].includes(b.status),
  );

  return NextResponse.json({
    cleaners,
    bookings,
    pendingCleaners,
    activeBookings,
    stats,
    summary: {
      totalCleaners: cleaners.length,
      verifiedCleaners: cleaners.filter((c) => c.verificationStatus === "VERIFIED").length,
      onlineCleaners: cleaners.filter((c) => c.isOnline).length,
      pendingVerification: pendingCleaners.length,
      activeJobs: activeBookings.length,
    },
  });
}
