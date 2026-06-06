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
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(20);
  const [submitting, setSubmitting] = useState(false);

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

  async function handlePay() {
    setSubmitting(true);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pay" }),
    });
    setSubmitting(false);
    fetchBooking();
  }

  async function handleRate() {
    setSubmitting(true);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rate", rating, tip }),
    });
    setSubmitting(false);
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
  const needsPayment = booking.status === "COMPLETED" && booking.paymentStatus === "PENDING";
  const canRate =
    booking.status === "COMPLETED" &&
    booking.paymentStatus === "PAID" &&
    booking.rating == null;

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-600">
        {booking.cleaner && (
          <>
            <div className="absolute left-[30%] top-[40%] h-4 w-4 rounded-full bg-gett-yellow shadow-lg pulse-dot" />
            <div className="absolute right-[28%] bottom-[35%] h-3 w-3 rounded-full bg-white shadow-lg" />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <p className="text-sm text-white/80">{booking.address}</p>
          {booking.mode === "SCHEDULED" && (
            <p className="text-xs text-white/60">Scheduled · {formatTime(booking.scheduledAt)}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <StatusTracker status={booking.status} etaMinutes={booking.etaMinutes} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-start gap-4">
          <span className="text-3xl">{service.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-gett-black">{service.label}</p>
            <p className="text-sm text-gray-500">
              {booking.roomCount} rooms · {formatTime(booking.scheduledAt)}
            </p>
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
                ⭐ {booking.cleaner.rating.toFixed(1)} · {booking.cleaner.jobsDone} jobs ·
                Verified
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

      {(booking.status === "SEARCHING" || booking.status === "OFFERED") && (
        <div className="rounded-2xl bg-amber-50 p-4 text-center text-sm text-amber-800">
          {booking.status === "OFFERED"
            ? "Offer sent to nearest cleaner — waiting for accept…"
            : "Finding the nearest verified cleaner…"}
        </div>
      )}

      {needsPayment && (
        <div className="rounded-2xl border-2 border-gett-green bg-gett-green/5 p-5">
          <p className="font-bold text-gett-black">Pay with card on file</p>
          <p className="mt-1 text-sm text-gray-600">
            Total {formatPrice(booking.price)} · Visa •••• 4242
          </p>
          <Button className="mt-4 w-full" onClick={handlePay} disabled={submitting}>
            Pay {formatPrice(booking.price)}
          </Button>
        </div>
      )}

      {booking.paymentStatus === "PAID" && !canRate && (
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
          Paid {formatPrice(booking.price)}
          {booking.tip > 0 && ` + ${formatPrice(booking.tip)} tip`}
          {booking.rating != null && ` · Rated ${booking.rating}★`}
        </div>
      )}

      {canRate && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="font-bold text-gett-black">Rate your cleaner</p>
          <div className="mt-3 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? "opacity-100" : "opacity-30"}`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {[0, 10, 20, 30].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTip(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                  tip === t ? "bg-gett-yellow text-gett-black" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t === 0 ? "No tip" : `₪${t}`}
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={handleRate} disabled={submitting}>
            Submit rating
          </Button>
        </div>
      )}

      {booking.status === "COMPLETED" && booking.rating != null && (
        <div className="rounded-2xl bg-gett-green/10 p-5 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 font-bold text-gett-green">All done!</p>
          <Link href="/book?mode=now" className="mt-4 inline-block">
            <Button size="md">Rebook favorite</Button>
          </Link>
        </div>
      )}

      {isActive && booking.status !== "SEARCHING" && booking.status !== "OFFERED" && (
        <p className="text-center text-xs text-gray-400">
          {STATUS_LABELS[booking.status]} · Live updates
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
