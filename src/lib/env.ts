export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  if (raw) return raw;

  if (import.meta.env.DEV) {
    console.warn(
      "[job-platform-web] VITE_API_BASE_URL is unset — using http://localhost:4000. Copy .env.example to .env to set it explicitly.",
    );
    return "http://localhost:4000";
  }

  throw new Error(
    "VITE_API_BASE_URL was not set at build time. For `vite build` locally: add it to `.env` or `.env.production`. For Docker/Dokploy: ensure `.env.production` is in the repo (see `.env.example`) or pass build-arg VITE_API_BASE_URL=https://your-api-host — `.env` is not copied into the image.",
  );
}
