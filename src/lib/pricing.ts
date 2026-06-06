import { ServiceType } from "@prisma/client";
import { getServiceOption } from "./constants";

const EXTRA_ROOM_PRICE = 35;

export function calculatePrice(serviceType: ServiceType, roomCount: number): number {
  const base = getServiceOption(serviceType).basePrice;
  const extraRooms = Math.max(0, roomCount - 2);
  return base + extraRooms * EXTRA_ROOM_PRICE;
}

export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const kmPerDegree = 111;
  return Math.hypot(dLat * kmPerDegree, dLng * kmPerDegree * 0.85);
}

export function estimateEtaMinutes(
  cleanerLat: number,
  cleanerLng: number,
  jobLat: number,
  jobLng: number,
): number {
  const km = distanceKm(cleanerLat, cleanerLng, jobLat, jobLng);
  return Math.max(5, Math.round(km * 4 + 8));
}

export function estimateWaitMinutes(onlineCount: number, nearestEta?: number): number {
  if (onlineCount === 0) return 45;
  if (nearestEta != null) return nearestEta;
  return Math.max(8, Math.round(15 / Math.sqrt(onlineCount)));
}
