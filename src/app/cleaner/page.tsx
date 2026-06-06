"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import {
  CHECKLIST_ITEMS,
  CLEANER_ADVANCE_LABELS,
  OFFER_TIMEOUT_SECONDS,
  formatPrice,
  getServiceOption,
  parseChecklist,
  STATUS_LABELS,
} from "@/lib/constants";
import { Booking, Cleaner, Customer, ServiceType } from "@prisma/client";

type BookingWithRelations = Booking & {
  customer: Customer;
  cleaner: Cleaner | null;
};

function OfferCountdown({ expiresAt }: { expiresAt: string }) {
  const [seconds, setSeconds] = useState(
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return (
    <span className="font-bold text-red-600">
      {seconds}s to accept
    </span>
  );
}

export default function CleanerPage() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [jobs, setJobs] = useState<BookingWithRelations[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<Record<string, boolean[]>>({});

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
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs);
      setEarnings(data.earnings);
      setCompletedCount(data.completedCount);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function toggleOnline() {
    if (!selected) return;
    const res = await fetch("/api/cleaners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, isOnline: !selected.isOnline }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Could not go online");
      return;
    }
    const updated = await res.json();
    setCleaners((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function acceptJob(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", cleanerId: selectedId }),
    });
    fetchJobs();
  }

  async function declineJob(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline", cleanerId: selectedId }),
    });
    fetchJobs();
  }

  async function advanceJob(bookingId: string) {
    const job = jobs.find((j) => j.id === bookingId);
    if (job?.status === "IN_PROGRESS") {
      const items = checklists[bookingId] ?? parseChecklist(job.checklistDone);
      const allDone = items.every(Boolean);
      if (!allDone) {
        alert("Complete the checklist before finishing the job");
        return;
      }
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checklist",
          items,
          photoNote: "Completion photo uploaded (demo)",
        }),
      });
    }

    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance" }),
    });
    fetchJobs();
  }

  function toggleChecklistItem(bookingId: string, index: number) {
    const job = jobs.find((j) => j.id === bookingId);
    const current =
      checklists[bookingId] ?? parseChecklist(job?.checklistDone ?? null);
    const next = [...current];
    next[index] = !next[index];
    setChecklists((prev) => ({ ...prev, [bookingId]: next }));
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gett-green border-t-transparent" />
      </div>
    );
  }

  const incomingOffers = jobs.filter(
    (j) => j.status === "OFFERED" && j.offeredCleanerId === selectedId,
  );
  const openRequests = jobs.filter((j) => j.status === "SEARCHING");
  const myJobs = jobs.filter(
    (j) => j.cleanerId === selectedId && !["COMPLETED", "CANCELLED"].includes(j.status),
  );

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gett-black">Cleaner app</h1>
        <p className="text-sm text-gray-500">Accept offers · navigate · complete checklist</p>
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
              {c.name} — {c.verificationStatus}
            </option>
          ))}
        </select>

        {selected && (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-bold">{selected.name}</p>
              <p className="text-sm text-white/60">
                {selected.jobsDone} jobs · ⭐ {selected.rating.toFixed(1)} ·{" "}
                {selected.verificationStatus}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleOnline}
              disabled={selected.verificationStatus !== "VERIFIED"}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                selected.isOnline
                  ? "bg-gett-green text-white"
                  : "bg-white/20 text-white/70 disabled:opacity-40"
              }`}
            >
              {selected.isOnline ? "● Online" : "○ Offline"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gett-green/10 p-4">
          <p className="text-xs text-gray-500">Earnings</p>
          <p className="text-xl font-bold text-gett-green">{formatPrice(earnings)}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Jobs done</p>
          <p className="text-xl font-bold text-gett-black">{completedCount}</p>
        </div>
      </div>

      {incomingOffers.length > 0 && selected?.isOnline && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Incoming offers ({incomingOffers.length})
          </h2>
          <div className="grid gap-3">
            {incomingOffers.map((job) => {
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
                        {job.customer.name} · {job.roomCount} rooms
                      </p>
                      {job.offerExpiresAt && (
                        <p className="mt-1 text-xs">
                          <OfferCountdown expiresAt={job.offerExpiresAt.toString()} />
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-gett-green">{formatPrice(job.price)}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => acceptJob(job.id)}>
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => declineJob(job.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {openRequests.length > 0 && selected?.isOnline && incomingOffers.length === 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Open requests ({openRequests.length})
          </h2>
          <div className="grid gap-3">
            {openRequests.map((job) => {
              const service = getServiceOption(job.serviceType as ServiceType);
              return (
                <div key={job.id} className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
                  <p className="font-bold">
                    {service.icon} {service.label} · {formatPrice(job.price)}
                  </p>
                  <p className="text-sm text-gray-600">📍 {job.address}</p>
                  <Button size="sm" className="mt-3 w-full" onClick={() => acceptJob(job.id)}>
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
            No active jobs. Go online to receive offers ({OFFER_TIMEOUT_SECONDS}s timeout).
          </div>
        ) : (
          <div className="grid gap-3">
            {myJobs.map((job) => {
              const service = getServiceOption(job.serviceType as ServiceType);
              const canAdvance = !["COMPLETED", "CANCELLED"].includes(job.status);
              const items = checklists[job.id] ?? parseChecklist(job.checklistDone);
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

                  {job.status === "IN_PROGRESS" && (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold uppercase text-gray-400">Checklist</p>
                      {CHECKLIST_ITEMS.map((label, i) => (
                        <label key={label} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={items[i]}
                            onChange={() => toggleChecklistItem(job.id, i)}
                            className="rounded border-gray-300 text-gett-green"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  )}

                  {canAdvance && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => advanceJob(job.id)}
                    >
                      {CLEANER_ADVANCE_LABELS[job.status] ?? "Update status"}
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
