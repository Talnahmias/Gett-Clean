"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
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

export default function CleanerPage() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [jobs, setJobs] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cleaners")
      .then((r) => r.json())
      .then((data: Cleaner[]) => {
        setCleaners(data);
        if (data.length > 0) setSelectedId(data[0].id);
        setLoading(false);
      });
  }, []);

  const selected = cleaners.find((c) => c.id === selectedId);

  const fetchJobs = useCallback(async () => {
    if (!selectedId) return;
    const res = await fetch(`/api/cleaners/jobs?cleanerId=${selectedId}`);
    if (res.ok) setJobs(await res.json());
  }, [selectedId]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function toggleOnline() {
    if (!selected) return;
    await fetch("/api/cleaners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, isOnline: !selected.isOnline }),
    });
    const res = await fetch("/api/cleaners");
    const data = await res.json();
    setCleaners(data);
  }

  async function acceptJob(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", cleanerId: selectedId }),
    });
    fetchJobs();
  }

  async function advanceJob(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance" }),
    });
    fetchJobs();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gett-green border-t-transparent" />
      </div>
    );
  }

  const myJobs = jobs.filter((j) => j.cleanerId === selectedId);
  const availableJobs = jobs.filter((j) => j.status === "SEARCHING");

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gett-black">Cleaner app</h1>
        <p className="text-sm text-gray-500">Accept jobs and update status</p>
      </div>

      <div className="rounded-2xl bg-gett-black p-5 text-white">
        <label className="text-xs font-semibold uppercase tracking-wide text-gett-yellow">
          Logged in as
        </label>
        <select
          className="mt-2 w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {cleaners.map((c) => (
            <option key={c.id} value={c.id} className="text-gett-black">
              {c.name} — ⭐ {c.rating}
            </option>
          ))}
        </select>

        {selected && (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-bold">{selected.name}</p>
              <p className="text-sm text-white/60">
                {selected.jobsDone} jobs · ⭐ {selected.rating}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleOnline}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                selected.isOnline
                  ? "bg-gett-green text-white"
                  : "bg-white/20 text-white/70"
              }`}
            >
              {selected.isOnline ? "● Online" : "○ Offline"}
            </button>
          </div>
        )}
      </div>

      {availableJobs.length > 0 && selected?.isOnline && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            New requests ({availableJobs.length})
          </h2>
          <div className="grid gap-3">
            {availableJobs.map((job) => {
              const service = getServiceOption(job.serviceType as ServiceType);
              return (
                <div
                  key={job.id}
                  className="rounded-2xl border-2 border-gett-yellow bg-amber-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gett-black">
                        {service.icon} {service.label}
                      </p>
                      <p className="text-sm text-gray-600">📍 {job.address}</p>
                      <p className="text-xs text-gray-400">
                        {job.customer.name} · {formatTime(job.scheduledAt)}
                      </p>
                    </div>
                    <p className="font-bold text-gett-green">{formatPrice(job.price)}</p>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => acceptJob(job.id)}
                  >
                    Accept job
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Active jobs ({myJobs.length})
        </h2>
        {myJobs.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-400">
            No active jobs. Go online to receive requests.
          </div>
        ) : (
          <div className="grid gap-3">
            {myJobs.map((job) => {
              const service = getServiceOption(job.serviceType as ServiceType);
              const canAdvance = !["COMPLETED", "CANCELLED"].includes(job.status);
              return (
                <div
                  key={job.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gett-black">
                        {service.icon} {service.label}
                      </p>
                      <p className="text-sm text-gray-600">📍 {job.address}</p>
                      <p className="text-xs text-gray-400">{job.customer.name}</p>
                    </div>
                    <span className="rounded-full bg-gett-green/10 px-3 py-1 text-xs font-semibold text-gett-green">
                      {STATUS_LABELS[job.status]}
                    </span>
                  </div>
                  {canAdvance && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => advanceJob(job.id)}
                    >
                      {job.status === "ASSIGNED"
                        ? "Start heading there"
                        : job.status === "EN_ROUTE"
                          ? "Start cleaning"
                          : job.status === "IN_PROGRESS"
                            ? "Mark complete"
                            : "Update status"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
