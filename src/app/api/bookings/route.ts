import { NextRequest, NextResponse } from "next/server";
import { ServiceType } from "@prisma/client";
import { getServiceOption } from "@/lib/constants";
import { bookingInclude, findNearestOnlineCleaner } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, address, lat, lng, serviceType, scheduledAt, notes } = body;

  if (!name || !phone || !address || !serviceType || !scheduledAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Object.values(ServiceType).includes(serviceType)) {
    return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
  }

  const service = getServiceOption(serviceType);
  const bookingLat = typeof lat === "number" ? lat : 32.0853;
  const bookingLng = typeof lng === "number" ? lng : 34.7818;

  let customer = await prisma.customer.findFirst({ where: { phone } });
  if (!customer) {
    customer = await prisma.customer.create({ data: { name, phone } });
  } else if (customer.name !== name) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name },
    });
  }

  const nearest = await findNearestOnlineCleaner(bookingLat, bookingLng);

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      serviceType,
      address,
      lat: bookingLat,
      lng: bookingLng,
      notes: notes || null,
      scheduledAt: new Date(scheduledAt),
      price: service.basePrice,
      status: nearest ? "ASSIGNED" : "SEARCHING",
      cleanerId: nearest?.id ?? null,
    },
    include: bookingInclude,
  });

  return NextResponse.json(booking, { status: 201 });
}
