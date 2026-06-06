import { NextRequest, NextResponse } from "next/server";
import { BookingMode, ServiceType } from "@prisma/client";
import { calculatePrice } from "@/lib/pricing";
import { estimateEtaMinutes } from "@/lib/pricing";
import { OFFER_TIMEOUT_SECONDS } from "@/lib/constants";
import {
  bookingInclude,
  findNearestOnlineCleaner,
  processExpiredOffers,
} from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await processExpiredOffers();
  const bookings = await prisma.booking.findMany({
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  await processExpiredOffers();
  const body = await request.json();
  const {
    name,
    phone,
    address,
    lat,
    lng,
    serviceType,
    scheduledAt,
    notes,
    mode = "ON_DEMAND",
    roomCount = 2,
  } = body;

  if (!name || !phone || !address || !serviceType || !scheduledAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Object.values(ServiceType).includes(serviceType)) {
    return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
  }

  const bookingMode =
    mode === "SCHEDULED" ? BookingMode.SCHEDULED : BookingMode.ON_DEMAND;
  const bookingLat = typeof lat === "number" ? lat : 32.0853;
  const bookingLng = typeof lng === "number" ? lng : 34.7818;
  const rooms = typeof roomCount === "number" ? Math.min(8, Math.max(1, roomCount)) : 2;
  const price = calculatePrice(serviceType, rooms);

  let customer = await prisma.customer.findFirst({ where: { phone } });
  if (!customer) {
    customer = await prisma.customer.create({ data: { name, phone } });
  } else if (customer.name !== name) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name },
    });
  }

  let status: "SEARCHING" | "OFFERED" = "SEARCHING";
  let offeredCleanerId: string | null = null;
  let offerExpiresAt: Date | null = null;
  let etaMinutes: number | null = null;

  if (bookingMode === BookingMode.ON_DEMAND) {
    const nearest = await findNearestOnlineCleaner(bookingLat, bookingLng);
    if (nearest) {
      status = "OFFERED";
      offeredCleanerId = nearest.id;
      offerExpiresAt = new Date(Date.now() + OFFER_TIMEOUT_SECONDS * 1000);
      etaMinutes = estimateEtaMinutes(nearest.lat, nearest.lng, bookingLat, bookingLng);
    }
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      serviceType,
      mode: bookingMode,
      address,
      lat: bookingLat,
      lng: bookingLng,
      roomCount: rooms,
      notes: notes || null,
      scheduledAt: new Date(scheduledAt),
      price,
      status,
      offeredCleanerId,
      offerExpiresAt,
      etaMinutes,
      cleanerId: null,
    },
    include: bookingInclude,
  });

  return NextResponse.json(booking, { status: 201 });
}
