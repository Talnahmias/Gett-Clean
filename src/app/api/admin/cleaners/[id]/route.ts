import { NextRequest, NextResponse } from "next/server";
import { VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === "verify") {
    const cleaner = await prisma.cleaner.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        insuranceId: body.insuranceId ?? `INS-${id.slice(-6).toUpperCase()}`,
      },
    });
    return NextResponse.json(cleaner);
  }

  if (body.action === "suspend") {
    const cleaner = await prisma.cleaner.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.SUSPENDED,
        isOnline: false,
      },
    });
    return NextResponse.json(cleaner);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
