# Frontend ↔ Backend Integration

This repo is a monorepo:

```
real-time-chat-app/
├── src/            # frontend (React 19 + Vite)  — unchanged
├── backend/        # backend  (Express + Prisma) — this addition
└── INTEGRATION.md  # you are here
```

## What "connected" means here

The backend was built to line up with the frontend **without touching a single
frontend file**:

1. **CORS** — the backend allows the Vite dev origin `http://localhost:5173`
   (configurable via `CORS_ORIGIN`).
2. **Base URL** — the frontend's Axios client defaults to
   `http://localhost:8080/api/v1`. The backend runs on port **8080** and mounts
   its router at **both** `/api` and `/api/v1`, so that default resolves as-is.
3. **Response envelope** — every backend response uses
   `{ success, data }` / `{ success, message, errors }`.

## Run both together

```bash
# Terminal 1 — backend + database
cd backend
docker compose up --build          # http://localhost:8080

# Terminal 2 — frontend
npm install
npm run dev                        # http://localhost:5173
```

Verify the backend from the frontend origin:

```bash
curl http://localhost:8080/api/health
# → { "success": true, "data": { "status": "ok", ... } }
```

## Going fully "live" (optional, requires editing the frontend)

The frontend currently ships with a **mock data layer** by design — each
service under `src/services/*.service.ts` returns local mock JSON via
`mockDelay(...)`, and every file carries a `TODO(backend)` comment showing the
real Axios call. The UI renders entirely from those mocks.

Because the instruction for this task was **"do not modify the frontend,"** those
service files were left as-is, so the running UI still uses mocks. To bind the UI
to this backend you would:

1. In `src/services/*.service.ts`, replace each `mockDelay(mock)` return with the
   `apiClient` call in its `TODO(backend)` comment (e.g.
   `apiClient.get("/dashboard").then(r => r.data.data)`).
2. Add a small **adapter** where shapes differ — the backend's `/api/dashboard`
   returns aggregate counters, whereas the frontend's `DashboardData` type also
   expects chart series (`passFail`, `responseTimes`, `executionTrend`). Map the
   backend response into the frontend type in the service.
3. Add auth: call `POST /api/auth/login`, store the returned JWT, and attach it
   in the Axios request interceptor (`src/services/axios.ts` already has the hook).

That step is intentionally left undone to respect the "don't modify the frontend"
constraint — say the word and it can be wired up.

## Quick auth check (backend only)

```bash
# Log in with the seeded admin (from backend/.env)
TOKEN=$(curl -s http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@rats.dev","password":"Admin@12345"}' | jq -r .data.token)

# Use it on a protected route
curl http://localhost:8080/api/dashboard -H "Authorization: Bearer $TOKEN"
```
