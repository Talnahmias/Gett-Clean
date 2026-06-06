import { NextRequest, NextResponse } from "next/server";
import {
  acceptOffer,
  advanceBookingStatus,
  bookingInclude,
  declineOffer,
  processExpiredOffers,
} from "@/lib/booking";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  await processExpiredOffers();
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
  await processExpiredOffers();
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
      data: {
        status: "CANCELLED",
        offeredCleanerId: null,
        offerExpiresAt: null,
      },
      include: bookingInclude,
    });
    return NextResponse.json(booking);
  }

  if (body.action === "accept" && body.cleanerId) {
    const booking = await acceptOffer(id, body.cleanerId);
    if (!booking) {
      return NextResponse.json({ error: "Offer unavailable" }, { status: 409 });
    }
    return NextResponse.json(booking);
  }

  if (body.action === "decline" && body.cleanerId) {
    const booking = await declineOffer(id, body.cleanerId);
    if (!booking) {
      return NextResponse.json({ error: "Offer unavailable" }, { status: 409 });
    }
    return NextResponse.json(booking);
  }

  if (body.action === "pay") {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
      },
      include: bookingInclude,
    });
    return NextResponse.json(booking);
  }

  if (body.action === "rate") {
    const { rating, tip = 0 } = body;
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { rating, tip: typeof tip === "number" ? tip : 0 },
      include: bookingInclude,
    });

    if (booking.cleanerId) {
      const cleaner = await prisma.cleaner.findUnique({
        where: { id: booking.cleanerId },
      });
      if (cleaner) {
        const newRating = (cleaner.rating * cleaner.jobsDone + rating) / (cleaner.jobsDone + 1);
        await prisma.cleaner.update({
          where: { id: booking.cleanerId },
          data: { rating: Math.round(newRating * 100) / 100 },
        });
      }
    }

    return NextResponse.json(booking);
  }

  if (body.action === "checklist") {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        checklistDone: JSON.stringify(body.items ?? []),
        photoNote: body.photoNote ?? null,
      },
      include: bookingInclude,
    });
    return NextResponse.json(booking);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
