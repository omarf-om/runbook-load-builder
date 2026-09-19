import { NextResponse } from "next/server";
import { fetchWalmartTenders } from "@/lib/walmart-client";
import { sanitizeTenders } from "@/lib/sanitize";
import { ApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const { loads } = await fetchWalmartTenders();
    const rows = sanitizeTenders(loads);
    return NextResponse.json({ rows });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message, retryAfterSeconds: err.retryAfterSeconds },
        { status: err.status }
      );
    }
    return NextResponse.json({ error: "Unexpected error fetching Walmart tenders." }, { status: 500 });
  }
}
