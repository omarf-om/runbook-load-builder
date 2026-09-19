import { CANDIDATE_EMAIL, WALMART_API_BASE } from "./config";
import { ApiError, parseRetryAfter } from "./api-error";
import type { WalmartLoadsResponse } from "./types";

/** Fetches every open tender for the account. No filtering — the case requires all records. */
export async function fetchWalmartTenders(): Promise<WalmartLoadsResponse> {
  const res = await fetch(`${WALMART_API_BASE}/api/sap/loads`, {
    headers: { Authorization: `Bearer ${CANDIDATE_EMAIL}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const retryAfter = parseRetryAfter(res.headers);
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw new ApiError(
      res.status === 401
        ? "Walmart API rejected the email — check the Authorization header."
        : res.status === 429
          ? "Walmart API rate limit exceeded."
          : `Walmart API error (${res.status}).`,
      res.status,
      retryAfter,
      body
    );
  }

  return res.json();
}
