"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { SERVICE_OPTIONS, formatPrice } from "@/lib/constants";
import { ServiceType } from "@prisma/client";
import { cn } from "@/lib/utils";

const ADDRESSES = [
  { label: "Rothschild 45, Tel Aviv", lat: 32.0644, lng: 34.7749 },
  { label: "Dizengoff 100, Tel Aviv", lat: 32.0853, lng: 34.7818 },
  { label: "Allenby 20, Tel Aviv", lat: 32.0709, lng: 34.7698 },
  { label: "Ben Yehuda 88, Tel Aviv", lat: 32.0892, lng: 34.7735 },
];

export default function BookPage() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<ServiceType>("STANDARD");
  const [addressIdx, setAddressIdx] = useState(1);
  const [name, setName] = useState("Alex Customer");
  const [phone, setPhone] = useState("050-999-9999");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = SERVICE_OPTIONS.find((s) => s.type === serviceType)!;
  const address = ADDRESSES[addressIdx];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + 2);

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
        <p className="text-sm text-gray-500">Choose service, location, and time</p>
      </div>

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
                <p className="font-bold text-gett-green">{formatPrice(service.basePrice)}</p>
                <p className="text-xs text-gray-400">{service.duration}</p>
              </div>
            </button>
          ))}
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
          placeholder="Notes for cleaner (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-gray-100 bg-white/95 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">Estimated total</span>
          <span className="text-xl font-bold text-gett-black">
            {formatPrice(selected.basePrice)}
          </span>
        </div>
        {error && <p className="mb-2 text-center text-sm text-red-600">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Finding cleaner…" : "Request cleaner"}
        </Button>
      </div>
    </form>
  );
}
