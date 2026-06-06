import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero map area */}
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
          <p className="mt-1 text-sm text-white/80">5 professionals online in Tel Aviv</p>
        </div>
        {/* Map pins */}
        <div className="absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-gett-yellow shadow-lg pulse-dot" />
        <div className="absolute right-[25%] top-[45%] h-3 w-3 rounded-full bg-gett-yellow shadow-lg" />
        <div className="absolute left-[45%] bottom-[25%] h-3 w-3 rounded-full bg-gett-yellow shadow-lg" />
      </div>

      <div className="animate-slide-up -mt-6 flex flex-1 flex-col gap-6 rounded-t-3xl bg-white p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-gett-black">Where to?</h2>
          <p className="mt-1 text-sm text-gray-500">
            Book a trusted cleaner in minutes — same simplicity as ordering a ride.
          </p>
        </div>

        <Link href="/book">
          <Button size="lg" className="w-full gap-2">
            <span>Book a clean</span>
            <span aria-hidden>→</span>
          </Button>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "✨", label: "Standard", price: "from ₪180" },
            { icon: "🧽", label: "Deep clean", price: "from ₪320" },
            { icon: "📦", label: "Move-out", price: "from ₪450" },
            { icon: "🏢", label: "Office", price: "from ₪250" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gett-green/30 hover:shadow-sm"
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
            Go online, accept jobs, and earn on your schedule.
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
