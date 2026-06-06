import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "32.0853");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "34.7818");
  const availability = await getAvailability(lat, lng);
  return NextResponse.json(availability);
}
