export class ApiError extends Error {
  status: number;
  retryAfterSeconds: number | null;
  body: unknown;

  constructor(message: string, status: number, retryAfterSeconds: number | null, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
    this.body = body;
  }
}

export function parseRetryAfter(headers: Headers): number | null {
  const raw = headers.get("Retry-After");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
