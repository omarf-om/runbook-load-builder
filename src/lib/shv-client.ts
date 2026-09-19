import { CANDIDATE_EMAIL, SHV_API_BASE, SHV_PUSH_BATCH_LIMIT } from "./config";
import { ApiError, parseRetryAfter } from "./api-error";
import type { ShvLoad, ShvPushResponse } from "./types";

/**
 * Pushes sanitized loads to the SHV SOR API in batches of at most 50 (API limit).
 * Each batch's accepted/rejected lists are merged into one combined response.
 */
export async function pushShvLoads(loads: ShvLoad[]): Promise<ShvPushResponse> {
  if (loads.length === 0) {
    return { status: "ok", message: "0 loads to push.", accepted: [], rejected: [] };
  }

  const chunks: ShvLoad[][] = [];
  for (let i = 0; i < loads.length; i += SHV_PUSH_BATCH_LIMIT) {
    chunks.push(loads.slice(i, i + SHV_PUSH_BATCH_LIMIT));
  }

  const accepted: string[] = [];
  const rejected: { load_number: string; errors: string[] }[] = [];
  const messages: string[] = [];

  for (const chunk of chunks) {
    const res = await fetch(`${SHV_API_BASE}/api/sor/loads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CANDIDATE_EMAIL}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loads: chunk }),
    });

    if (res.status === 401 || res.status === 429 || res.status === 400) {
      const retryAfter = parseRetryAfter(res.headers);
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      throw new ApiError(
        res.status === 401
          ? "SHV API rejected the email — check the Authorization header."
          : res.status === 429
            ? "SHV API rate limit or capacity exceeded."
            : "SHV API rejected the request body.",
        res.status,
        retryAfter,
        body
      );
    }

    const data: ShvPushResponse = await res.json();
    accepted.push(...data.accepted);
    rejected.push(...data.rejected);
    messages.push(data.message);
  }

  return {
    status: rejected.length === 0 ? "ok" : "rejected",
    message: messages.join(" "),
    accepted,
    rejected,
  };
}
