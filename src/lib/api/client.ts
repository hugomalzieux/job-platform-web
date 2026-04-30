import { getApiBase } from "../env.js";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody | null,
  ) {
    super(body?.error.message ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    if (window.location.protocol === "https:" && url.startsWith("http://")) {
      throw new Error(
        "This site is HTTPS but VITE_API_BASE_URL uses HTTP — the browser blocks that (mixed content). Rebuild the frontend with an https:// API URL.",
      );
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "include",
      ...init,
      headers,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    const origin = typeof window !== "undefined" ? window.location.origin : "your SPA origin";
    throw new Error(
      `Can't reach the API at ${base}. (${detail}) — Check the API is up, APP_BASE_URL on the server is ${origin} (scheme + host + port), CORS/CORS_ORIGINS if needed, and HTTPS↔HTTPS matching.`,
    );
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = null;
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, json as ApiErrorBody | null);
  }
  return json as T;
}
