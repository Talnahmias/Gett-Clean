"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { formatPrice, formatTime, STATUS_LABELS } from "@/lib/constants";
import { Booking, Cleaner, Customer } from "@prisma/client";

type BookingRow = Booking & { customer: Customer; cleaner: Cleaner | null };

type AdminData = {
  cleaners: Cleaner[];
  bookings: BookingRow[];
  pendingCleaners: Cleaner[];
  summary: {
    totalCleaners: number;
    verifiedCleaners: number;
    onlineCleaners: number;
    pendingVerification: number;
    activeJobs: number;
  };
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function verifyCleaner(id: string) {
    await fetch(`/api/admin/cleaners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    load();
  }

  async function suspendCleaner(id: string) {
    await fetch(`/api/admin/cleaners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "suspend" }),
    });
    load();
  }

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gett-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gett-black">Ops / Admin</h1>
        <p className="text-sm text-gray-500">Verify cleaners · monitor jobs · handle coverage</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Verified", value: data.summary.verifiedCleaners },
          { label: "Online", value: data.summary.onlineCleaners },
          { label: "Pending KYC", value: data.summary.pendingVerification },
          { label: "Active jobs", value: data.summary.activeJobs },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gett-black">{s.value}</p>
          </div>
        ))}
      </div>

      {data.pendingCleaners.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Pending verification
          </h2>
          <div className="grid gap-3">
            {data.pendingCleaners.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"
              >
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.phone}</p>
                  <p className="text-xs text-amber-700">Background check · insurance pending</p>
                </div>
                <Button size="sm" onClick={() => verifyCleaner(c.id)}>
                  Verify
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Cleaners
        </h2>
        <div className="grid gap-2">
          {data.cleaners.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-gray-100"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {c.verificationStatus} · {c.isOnline ? "online" : "offline"}
                  {c.insuranceId && ` · ${c.insuranceId}`}
                </p>
              </div>
              {c.verificationStatus === "VERIFIED" && (
                <button
                  type="button"
                  onClick={() => suspendCleaner(c.id)}
                  className="text-xs text-red-600 underline"
                >
                  Suspend
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Recent bookings
        </h2>
        <div className="grid gap-2">
          {data.bookings.slice(0, 10).map((b) => (
            <div key={b.id} className="rounded-xl bg-white p-3 ring-1 ring-gray-100">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{b.customer.name}</p>
                <p className="text-sm font-bold text-gett-green">{formatPrice(b.price)}</p>
              </div>
              <p className="text-xs text-gray-500">
                {STATUS_LABELS[b.status]} · {b.mode} · {formatTime(b.scheduledAt)}
              </p>
              <p className="text-xs text-gray-400 truncate">{b.address}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
