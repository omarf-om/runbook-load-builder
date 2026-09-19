import { NextResponse } from "next/server";
import { fetchWalmartTenders } from "@/lib/walmart-client";
import { sanitizeTenders } from "@/lib/sanitize";
import { pushShvLoads } from "@/lib/shv-client";
import { ApiError } from "@/lib/api-error";
import type { PushResultRow } from "@/lib/types";

interface RequestBody {
  loadNumbers: string[];
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const selected = new Set(body.loadNumbers ?? []);
  if (selected.size === 0) {
    return NextResponse.json({ error: "No loads selected." }, { status: 400 });
  }

  try {
    const { loads } = await fetchWalmartTenders();
    const rows = sanitizeTenders(loads);

    const toPush = rows.filter((r) => selected.has(r.loadNumber) && r.status === "ready");
    const pushResponse = await pushShvLoads(toPush.map((r) => r.shvLoad!));

    const acceptedSet = new Set(pushResponse.accepted);
    const rejectedMap = new Map(pushResponse.rejected.map((r) => [r.load_number, r.errors]));

    const results: PushResultRow[] = rows.map((row) => {
      if (!selected.has(row.loadNumber)) {
        return { loadNumber: row.loadNumber, outcome: "not_selected" };
      }
      if (row.status === "manual_review") {
        return { loadNumber: row.loadNumber, outcome: "skipped_manual_review", errors: row.reasons };
      }
      if (acceptedSet.has(row.loadNumber)) {
        return { loadNumber: row.loadNumber, outcome: "accepted" };
      }
      if (rejectedMap.has(row.loadNumber)) {
        return { loadNumber: row.loadNumber, outcome: "rejected", errors: rejectedMap.get(row.loadNumber) };
      }
      return { loadNumber: row.loadNumber, outcome: "not_selected" };
    });

    return NextResponse.json({
      rows,
      results,
      summary: {
        accepted: results.filter((r) => r.outcome === "accepted").length,
        rejected: results.filter((r) => r.outcome === "rejected").length,
        skippedManualReview: results.filter((r) => r.outcome === "skipped_manual_review").length,
        notSelected: results.filter((r) => r.outcome === "not_selected").length,
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message, retryAfterSeconds: err.retryAfterSeconds },
        { status: err.status }
      );
    }
    return NextResponse.json({ error: "Unexpected error pushing loads." }, { status: 500 });
  }
}
