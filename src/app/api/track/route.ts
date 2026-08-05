import { NextRequest, NextResponse } from "next/server";
import { trackSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { lookupTrackingStatus } from "@/lib/dashboard";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`track:${ip}`)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const status = await lookupTrackingStatus(parsed.data.reference, parsed.data.contact);
  if (!status) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ status });
}
