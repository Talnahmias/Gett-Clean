import { NextRequest, NextResponse } from "next/server";
import { advanceBookingStatus, bookingInclude } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === "advance") {
    const booking = await advanceBookingStatus(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
  }

  if (body.action === "cancel") {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: bookingInclude,
    });
    return NextResponse.json(booking);
  }

  if (body.action === "accept" && body.cleanerId) {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: "ASSIGNED",
        cleanerId: body.cleanerId,
      },
      include: bookingInclude,
    });
    return NextResponse.json(booking);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
