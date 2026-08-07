import { NextRequest } from "next/server";
import { MAX_JSON_BODY_SIZE, trackSchema } from "@/lib/validation";
import { lookupTrackingStatus } from "@/lib/dashboard";
import { guardRequest, isGuardFailure, json } from "@/lib/apiGuards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  const guard = guardRequest(request, "track", MAX_JSON_BODY_SIZE);
  if (isGuardFailure(guard)) return guard.response;
  const { headers } = guard;

  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "invalid" }, { status: 400, headers });
  }

  const status = await lookupTrackingStatus(parsed.data.reference, parsed.data.contact);
  if (!status) {
    // Deliberately one response for "no such reference", "wrong contact" and
    // "dashboard unreachable". Distinguishing them would turn this into an
    // oracle for guessing which reference numbers exist.
    return json({ error: "not_found" }, { status: 404, headers });
  }

  return json({ status }, { headers });
}
