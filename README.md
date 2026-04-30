# job-platform-web

Frontend admin UI for the personal job-offer platform ([spec](../job-platform/job-platform-specs/00_README.md)).

Stack: Vite, React 19, React Router 7 (data router), TanStack Query, Tailwind CSS, React Hook Form + Zod.

## Setup

```bash
cp .env.example .env
# Set VITE_API_BASE_URL to your API origin, e.g. http://localhost:4000
# If you skip .env in dev, the app defaults to http://localhost:4000 (see console warning).

npm install
npm run dev
```

## Production deploy checklist

Open **`deploy/index.html`** in a browser for build steps, `VITE_API_BASE_URL`, Docker, and how this relates to `APP_BASE_URL` on the API.

## Docker

Multi-stage image: Vite build + nginx serving `dist` on port **3008** (SPA fallback in `docker/nginx.conf`).

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t job-platform-web .
docker run --rm -p 8080:3008 job-platform-web
```

Pass **`VITE_API_BASE_URL`** at **build** time. No trailing slash.

### Dokploy (Dockerfile application — not Compose)

1. Create a **Dockerfile** application in Dokploy and point it at **this repo** (`job-platform-web`).
2. Add build argument **`VITE_API_BASE_URL`** = your public API URL (no trailing slash).
3. Route your **UI domain** to container port **3008**.
4. On the **API**, set **`APP_BASE_URL`** to that UI origin (`https://your-app.example.com`) so cookies and CORS match the SPA.

Full checklist: open **`deploy/index.html`** in a browser (same steps with context).

**HTTPS:** If the UI is served over `https://`, `VITE_API_BASE_URL` must be `https://…` too when you build the image — browsers block `http://` API calls from HTTPS pages (mixed content).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (:5173) |
| `npm run build` | Typecheck + production bundle |
| `npm run preview` | Preview production build |
| `npm test` | Vitest |

## Auth / cookies

The UI talks to the API with `credentials: "include"` so the HTTP-only session cookie works when **both apps share localhost** (different ports). Ensure `APP_BASE_URL` on the API matches this origin (`http://localhost:5173` in development).

## Separate Git repository

```bash
git init
git add .
git commit -m "chore: initial job-platform-web"
```
