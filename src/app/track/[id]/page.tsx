"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { StatusTracker } from "@/components/StatusTracker";
import {
  formatPrice,
  formatTime,
  getServiceOption,
  STATUS_LABELS,
} from "@/lib/constants";
import { Booking, Cleaner, Customer, ServiceType } from "@prisma/client";

type BookingWithRelations = Booking & {
  customer: Customer;
  cleaner: Cleaner | null;
};

export default function TrackPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    const res = await fetch(`/api/bookings/${id}`);
    if (res.ok) {
      setBooking(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 3000);
    return () => clearInterval(interval);
  }, [fetchBooking]);

  async function handleCancel() {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    fetchBooking();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gett-green border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Booking not found</p>
        <Link href="/book" className="mt-4 inline-block text-gett-green underline">
          Book a new clean
        </Link>
      </div>
    );
  }

  const service = getServiceOption(booking.serviceType as ServiceType);
  const isActive = !["COMPLETED", "CANCELLED"].includes(booking.status);

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-600">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="track-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#track-grid)" />
          </svg>
        </div>
        {booking.cleaner && (
          <>
            <div className="absolute left-[30%] top-[40%] h-4 w-4 rounded-full bg-gett-yellow shadow-lg pulse-dot" />
            <div className="absolute right-[28%] bottom-[35%] h-3 w-3 rounded-full bg-white shadow-lg" />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <p className="text-sm text-white/80">{booking.address}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <StatusTracker status={booking.status} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-start gap-4">
          <span className="text-3xl">{service.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-gett-black">{service.label}</p>
            <p className="text-sm text-gray-500">{formatTime(booking.scheduledAt)}</p>
            <p className="mt-1 text-lg font-bold text-gett-green">
              {formatPrice(booking.price)}
            </p>
          </div>
        </div>
      </div>

      {booking.cleaner && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Your cleaner
          </p>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gett-green text-xl font-bold text-white">
              {booking.cleaner.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gett-black">{booking.cleaner.name}</p>
              <p className="text-sm text-gray-500">
                ⭐ {booking.cleaner.rating.toFixed(1)} · {booking.cleaner.jobsDone} jobs
              </p>
            </div>
            <a
              href={`tel:${booking.cleaner.phone}`}
              className="rounded-full bg-gett-yellow px-4 py-2 text-sm font-bold text-gett-black"
            >
              Call
            </a>
          </div>
        </div>
      )}

      {booking.status === "SEARCHING" && (
        <div className="rounded-2xl bg-amber-50 p-4 text-center text-sm text-amber-800">
          Searching for the nearest available cleaner…
        </div>
      )}

      {booking.status === "COMPLETED" && (
        <div className="rounded-2xl bg-gett-green/10 p-5 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 font-bold text-gett-green">All done!</p>
          <p className="text-sm text-gray-600">Thanks for using Gett Clean</p>
          <Link href="/book" className="mt-4 inline-block">
            <Button size="md">Book again</Button>
          </Link>
        </div>
      )}

      {isActive && booking.status !== "SEARCHING" && (
        <p className="text-center text-xs text-gray-400">
          Status: {STATUS_LABELS[booking.status]} · Updates every 3s
        </p>
      )}

      {isActive && (
        <Button variant="outline" onClick={handleCancel} className="w-full">
          Cancel booking
        </Button>
      )}
    </div>
  );
}
