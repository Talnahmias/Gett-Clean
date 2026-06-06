import { ServiceType } from "@prisma/client";

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
  ASSIGNED: "Cleaner assigned",
  EN_ROUTE: "On the way",
  IN_PROGRESS: "Cleaning in progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_STEPS = [
  "SEARCHING",
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export function formatPrice(agorot: number): string {
  return `₪${(agorot / 1).toFixed(0)}`;
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}
