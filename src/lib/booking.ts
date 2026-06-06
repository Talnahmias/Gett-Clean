import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export const bookingInclude = {
  customer: true,
  cleaner: true,
} satisfies Prisma.BookingInclude;

export async function findNearestOnlineCleaner(lat: number, lng: number) {
  const cleaners = await prisma.cleaner.findMany({
    where: { isOnline: true },
  });

  if (cleaners.length === 0) return null;

  return cleaners.reduce((best, c) => {
    const bestDist = Math.hypot(best.lat - lat, best.lng - lng);
    const cDist = Math.hypot(c.lat - lat, c.lng - lng);
    return cDist < bestDist ? c : best;
  });
}

export async function advanceBookingStatus(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  const flow: BookingStatus[] = [
    "SEARCHING",
    "ASSIGNED",
    "EN_ROUTE",
    "IN_PROGRESS",
    "COMPLETED",
  ];
  const idx = flow.indexOf(booking.status);
  if (idx === -1 || idx >= flow.length - 1) return booking;

  const next = flow[idx + 1];
  const data: Prisma.BookingUpdateInput = { status: next };

  if (next === "ASSIGNED" && !booking.cleanerId) {
    const cleaner = await findNearestOnlineCleaner(booking.lat, booking.lng);
    if (cleaner) {
      data.cleaner = { connect: { id: cleaner.id } };
    }
  }

  if (next === "COMPLETED" && booking.cleanerId) {
    await prisma.cleaner.update({
      where: { id: booking.cleanerId },
      data: { jobsDone: { increment: 1 } },
    });
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data,
    include: bookingInclude,
  });
}
