import { ServiceType } from "@prisma/client";

export const OFFER_TIMEOUT_SECONDS = 60;

export const CHECKLIST_ITEMS = [
  "Kitchen surfaces & appliances wiped",
  "Bathrooms sanitized",
  "Floors vacuumed & mopped",
  "Trash removed",
  "Final walkthrough done",
];

export const SERVICE_OPTIONS: {
  type: ServiceType;
  label: string;
  description: string;
  duration: string;
  basePrice: number;
  icon: string;
}[] = [
  {
    type: "STANDARD",
    label: "Standard Clean",
    description: "Kitchen, bathrooms, floors & surfaces",
    duration: "2–3 hrs",
    basePrice: 180,
    icon: "✨",
  },
  {
    type: "DEEP",
    label: "Deep Clean",
    description: "Inside appliances, baseboards, detailed scrub",
    duration: "4–5 hrs",
    basePrice: 320,
    icon: "🧽",
  },
  {
    type: "MOVE_OUT",
    label: "Move-out Clean",
    description: "Full property reset for handover",
    duration: "5–6 hrs",
    basePrice: 450,
    icon: "📦",
  },
  {
    type: "OFFICE",
    label: "Office Clean",
    description: "Desks, meeting rooms & common areas",
    duration: "2–4 hrs",
    basePrice: 250,
    icon: "🏢",
  },
];

export function getServiceOption(type: ServiceType) {
  return SERVICE_OPTIONS.find((s) => s.type === type)!;
}

export const STATUS_LABELS: Record<string, string> = {
  SEARCHING: "Finding your cleaner",
  OFFERED: "Waiting for cleaner to accept",
  ASSIGNED: "Cleaner assigned",
  EN_ROUTE: "On the way",
  ARRIVED: "Cleaner arrived",
  IN_PROGRESS: "Cleaning in progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_STEPS = [
  "SEARCHING",
  "ASSIGNED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export const CLEANER_ADVANCE_LABELS: Record<string, string> = {
  ASSIGNED: "Start heading there",
  EN_ROUTE: "Mark arrived",
  ARRIVED: "Start cleaning",
  IN_PROGRESS: "Complete job",
};

export function formatPrice(amount: number): string {
  return `₪${amount.toFixed(0)}`;
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function mapStatusToStep(status: string): (typeof STATUS_STEPS)[number] {
  if (status === "OFFERED" || status === "SEARCHING") return "SEARCHING";
  if (STATUS_STEPS.includes(status as (typeof STATUS_STEPS)[number])) {
    return status as (typeof STATUS_STEPS)[number];
  }
  return "SEARCHING";
}

export function parseChecklist(json: string | null): boolean[] {
  if (!json) return CHECKLIST_ITEMS.map(() => false);
  try {
    const arr = JSON.parse(json) as boolean[];
    return CHECKLIST_ITEMS.map((_, i) => Boolean(arr[i]));
  } catch {
    return CHECKLIST_ITEMS.map(() => false);
  }
}
