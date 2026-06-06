"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { formatEta } from "@/lib/constants";

type Availability = {
  onlineCount: number;
  estimatedWaitMinutes: number;
  nextAvailableSlot: string;
};

export default function HomePage() {
  const [availability, setAvailability] = useState<Availability | null>(null);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then(setAvailability)
      .catch(() => null);
  }, []);

  const waitLabel = availability
    ? availability.onlineCount > 0
      ? `${formatEta(availability.estimatedWaitMinutes)} away`
      : "Schedule for later"
    : "Loading…";

  return (
    <div className="flex flex-col">
      <div className="relative h-64 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gett-yellow text-3xl shadow-lg">
            🧹
          </div>
          <h1 className="text-2xl font-bold">Cleaners nearby</h1>
          <p className="mt-1 text-sm text-white/80">
            {availability
              ? `${availability.onlineCount} verified pros online · ${waitLabel}`
              : "Checking availability…"}
          </p>
        </div>
        <div className="absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-gett-yellow shadow-lg pulse-dot" />
        <div className="absolute right-[25%] top-[45%] h-3 w-3 rounded-full bg-gett-yellow shadow-lg" />
        <div className="absolute left-[45%] bottom-[25%] h-3 w-3 rounded-full bg-gett-yellow shadow-lg" />
      </div>

      <div className="animate-slide-up -mt-6 flex flex-1 flex-col gap-6 rounded-t-3xl bg-white p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-gett-black">Book a trusted cleaner</h2>
          <p className="mt-1 text-sm text-gray-500">
            On-demand or scheduled — with live job status like a ride.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/book?mode=now" className="col-span-2">
            <Button size="lg" className="w-full gap-2">
              <span>Book now</span>
              <span className="text-sm font-normal opacity-80">· {waitLabel}</span>
            </Button>
          </Link>
          <Link href="/book?mode=schedule" className="col-span-2">
            <Button variant="outline" size="lg" className="w-full">
              Schedule for later
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "✨", label: "Standard", price: "from ₪180" },
            { icon: "🧽", label: "Deep clean", price: "from ₪320" },
            { icon: "📦", label: "Move-out", price: "from ₪450" },
            { icon: "🏢", label: "Office", price: "from ₪250" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="mt-2 font-semibold text-gett-black">{item.label}</p>
              <p className="text-xs text-gray-500">{item.price}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-gett-black p-4 text-white">
          <p className="text-sm font-medium text-gett-yellow">For cleaners</p>
          <p className="mt-1 text-sm text-white/70">
            Go online, accept offers, complete checklist, get paid.
          </p>
          <Link href="/cleaner" className="mt-3 inline-block">
            <Button variant="secondary" size="sm">
              Open cleaner app
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
