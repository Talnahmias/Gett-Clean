import { BookingStatus, Prisma, VerificationStatus } from "@prisma/client";
import { OFFER_TIMEOUT_SECONDS } from "./constants";
import { estimateEtaMinutes } from "./pricing";
import { prisma } from "./prisma";

export const bookingInclude = {
  customer: true,
  cleaner: true,
} satisfies Prisma.BookingInclude;

const verifiedOnline = {
  isOnline: true,
  verificationStatus: VerificationStatus.VERIFIED,
} as const;

export async function findNearestOnlineCleaner(
  lat: number,
  lng: number,
  excludeIds: string[] = [],
) {
  const cleaners = await prisma.cleaner.findMany({
    where: {
      ...verifiedOnline,
      id: excludeIds.length ? { notIn: excludeIds } : undefined,
    },
  });

  if (cleaners.length === 0) return null;

  return cleaners.reduce((best, c) => {
    const bestDist = Math.hypot(best.lat - lat, best.lng - lng);
    const cDist = Math.hypot(c.lat - lat, c.lng - lng);
    return cDist < bestDist ? c : best;
  });
}

export async function processExpiredOffers() {
  const now = new Date();
  const expired = await prisma.booking.findMany({
    where: {
      status: "OFFERED",
      offerExpiresAt: { lt: now },
    },
  });

  for (const booking of expired) {
    await rotateOffer(booking.id, booking.offeredCleanerId ? [booking.offeredCleanerId] : []);
  }
}

export async function rotateOffer(bookingId: string, excludeIds: string[] = []) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status === "CANCELLED") return null;

  const next = await findNearestOnlineCleaner(booking.lat, booking.lng, excludeIds);

  if (!next) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "SEARCHING",
        offeredCleanerId: null,
        offerExpiresAt: null,
        etaMinutes: null,
      },
      include: bookingInclude,
    });
  }

  const etaMinutes = estimateEtaMinutes(next.lat, next.lng, booking.lat, booking.lng);
  const offerExpiresAt = new Date(Date.now() + OFFER_TIMEOUT_SECONDS * 1000);

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "OFFERED",
      offeredCleanerId: next.id,
      offerExpiresAt,
      etaMinutes,
      cleanerId: null,
    },
    include: bookingInclude,
  });
}

export async function createOfferForBooking(bookingId: string) {
  return rotateOffer(bookingId, []);
}

export async function acceptOffer(bookingId: string, cleanerId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  if (booking.status === "OFFERED" && booking.offeredCleanerId !== cleanerId) {
    return null;
  }
  if (!["OFFERED", "SEARCHING"].includes(booking.status)) {
    return null;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "ASSIGNED",
      cleanerId,
      offeredCleanerId: null,
      offerExpiresAt: null,
    },
    include: bookingInclude,
  });
}

export async function declineOffer(bookingId: string, cleanerId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.offeredCleanerId !== cleanerId) return null;

  return rotateOffer(bookingId, [cleanerId]);
}

export async function advanceBookingStatus(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  const flow: BookingStatus[] = [
    "ASSIGNED",
    "EN_ROUTE",
    "ARRIVED",
    "IN_PROGRESS",
    "COMPLETED",
  ];

  let idx = flow.indexOf(booking.status);
  if (idx === -1) {
    if (booking.status === "OFFERED" || booking.status === "SEARCHING") {
      idx = -1;
    } else {
      return booking;
    }
  }

  if (idx >= flow.length - 1) return booking;

  const next = flow[idx + 1];
  const data: Prisma.BookingUpdateInput = { status: next };

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

export async function getAvailability(lat = 32.0853, lng = 34.7818) {
  await processExpiredOffers();

  const onlineCleaners = await prisma.cleaner.findMany({
    where: verifiedOnline,
  });

  let nearestEta: number | undefined;
  if (onlineCleaners.length > 0) {
    const nearest = onlineCleaners.reduce((best, c) => {
      const bestDist = Math.hypot(best.lat - lat, best.lng - lng);
      const cDist = Math.hypot(c.lat - lat, c.lng - lng);
      return cDist < bestDist ? c : best;
    });
    nearestEta = estimateEtaMinutes(nearest.lat, nearest.lng, lat, lng);
  }

  const waitMinutes =
    onlineCleaners.length === 0
      ? 45
      : nearestEta != null
        ? nearestEta
        : 15;

  const nextSlot = new Date();
  nextSlot.setMinutes(nextSlot.getMinutes() + waitMinutes);

  return {
    onlineCount: onlineCleaners.length,
    estimatedWaitMinutes: waitMinutes,
    nextAvailableSlot: nextSlot.toISOString(),
    nearestEtaMinutes: nearestEta ?? null,
  };
}
