"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { SERVICE_OPTIONS, formatEta, formatPrice, formatTime } from "@/lib/constants";
import { calculatePrice } from "@/lib/pricing";
import { BookingMode, ServiceType } from "@prisma/client";
import { cn } from "@/lib/utils";

const ADDRESSES = [
  { label: "Rothschild 45, Tel Aviv", lat: 32.0644, lng: 34.7749 },
  { label: "Dizengoff 100, Tel Aviv", lat: 32.0853, lng: 34.7818 },
  { label: "Allenby 20, Tel Aviv", lat: 32.0709, lng: 34.7698 },
  { label: "Ben Yehuda 88, Tel Aviv", lat: 32.0892, lng: 34.7735 },
];

function defaultScheduleValue() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(14, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gett-green border-t-transparent" />
        </div>
      }
    >
      <BookForm />
    </Suspense>
  );
}

function BookForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "schedule" ? "SCHEDULED" : "ON_DEMAND";

  const [mode, setMode] = useState<BookingMode>(initialMode);
  const [serviceType, setServiceType] = useState<ServiceType>("STANDARD");
  const [addressIdx, setAddressIdx] = useState(1);
  const [roomCount, setRoomCount] = useState(2);
  const [name, setName] = useState("Alex Customer");
  const [phone, setPhone] = useState("050-999-9999");
  const [notes, setNotes] = useState("");
  const [scheduleValue, setScheduleValue] = useState(defaultScheduleValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waitMinutes, setWaitMinutes] = useState<number | null>(null);

  const address = ADDRESSES[addressIdx];
  const price = useMemo(
    () => calculatePrice(serviceType, roomCount),
    [serviceType, roomCount],
  );

  useEffect(() => {
    fetch(`/api/availability?lat=${address.lat}&lng=${address.lng}`)
      .then((r) => r.json())
      .then((d) => setWaitMinutes(d.estimatedWaitMinutes))
      .catch(() => null);
  }, [address.lat, address.lng]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const scheduledAt =
      mode === "ON_DEMAND"
        ? new Date(Date.now() + (waitMinutes ?? 15) * 60 * 1000)
        : new Date(scheduleValue);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address: address.label,
          lat: address.lat,
          lng: address.lng,
          serviceType,
          mode,
          roomCount,
          scheduledAt: scheduledAt.toISOString(),
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to book");
      }

      const booking = await res.json();
      router.push(`/track/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gett-black">Book a clean</h1>
        <p className="text-sm text-gray-500">Upfront price · live status · trusted cleaners</p>
      </div>

      <div className="flex rounded-xl bg-gray-100 p-1">
        {(["ON_DEMAND", "SCHEDULED"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition",
              mode === m ? "bg-white text-gett-black shadow-sm" : "text-gray-500",
            )}
          >
            {m === "ON_DEMAND" ? "Book now" : "Schedule"}
          </button>
        ))}
      </div>

      {mode === "ON_DEMAND" && waitMinutes != null && (
        <div className="rounded-xl bg-gett-green/10 px-4 py-3 text-sm text-gett-green-dark">
          Nearest cleaner ~{formatEta(waitMinutes)} away
        </div>
      )}

      {mode === "SCHEDULED" && (
        <section>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-400">
            Date & time
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gett-green"
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            Cleaner assigned closer to your slot
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Service type
        </h2>
        <div className="grid gap-2">
          {SERVICE_OPTIONS.map((service) => (
            <button
              key={service.type}
              type="button"
              onClick={() => setServiceType(service.type)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition",
                serviceType === service.type
                  ? "border-gett-green bg-gett-green/5"
                  : "border-gray-100 bg-white hover:border-gray-200",
              )}
            >
              <span className="text-2xl">{service.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gett-black">{service.label}</p>
                <p className="text-xs text-gray-500">{service.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gett-green">
                  {formatPrice(calculatePrice(service.type, roomCount))}
                </p>
                <p className="text-xs text-gray-400">{service.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Rooms
        </h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setRoomCount((r) => Math.max(1, r - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
          >
            −
          </button>
          <span className="text-2xl font-bold text-gett-black">{roomCount}</span>
          <button
            type="button"
            onClick={() => setRoomCount((r) => Math.min(8, r + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
          >
            +
          </button>
          <span className="text-sm text-gray-500">+₪35 per room above 2</span>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Address
        </h2>
        <div className="grid gap-2">
          {ADDRESSES.map((addr, i) => (
            <button
              key={addr.label}
              type="button"
              onClick={() => setAddressIdx(i)}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition",
                addressIdx === i
                  ? "border-gett-green bg-gett-green/5 text-gett-black"
                  : "border-gray-100 bg-white text-gray-700 hover:border-gray-200",
              )}
            >
              📍 {addr.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Your details
        </h2>
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gett-green focus:ring-2 focus:ring-gett-green/20"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gett-green focus:ring-2 focus:ring-gett-green/20"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <textarea
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gett-green focus:ring-2 focus:ring-gett-green/20"
          placeholder="Access notes (door code, pets, etc.)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-gray-100 bg-white/95 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">Upfront total</span>
          <span className="text-xl font-bold text-gett-black">{formatPrice(price)}</span>
        </div>
        {error && <p className="mb-2 text-center text-sm text-red-600">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading
            ? "Matching cleaner…"
            : mode === "ON_DEMAND"
              ? "Confirm & request now"
              : `Schedule · ${formatTime(scheduleValue)}`}
        </Button>
      </div>
    </form>
  );
}
