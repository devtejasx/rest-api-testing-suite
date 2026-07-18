# REST API Testing Suite — Frontend

A professional, production-quality SaaS dashboard for managing automated REST API
testing. Built as a portfolio project with a clean dark theme inspired by Vercel,
GitHub, Postman and Railway.

> **Frontend only.** There is no backend yet. Every screen is powered by a typed
> mock-data layer behind Axios services and TanStack Query hooks, so wiring a real
> API later requires no component changes.

## Tech Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Framework      | React 19 + TypeScript           |
| Build tool     | Vite 6                          |
| Styling        | Tailwind CSS + shadcn/ui        |
| Routing        | React Router 7                  |
| Data fetching  | TanStack Query 5 + Axios        |
| Charts         | Recharts                        |
| Animation      | Framer Motion                   |
| Icons          | Lucide                          |

## Features / Pages

1. **Dashboard** — KPI stat cards, Pass/Fail donut, response-time area chart,
   execution-trend bars, live environment panel and a recent-activity table.
2. **Collections** — searchable, status-filterable grid of Postman collections.
3. **Collection Details** — collapsible folder hierarchy (Authentication / Users /
   Todos) with method, endpoint, description and attached tests per request.
4. **Test Execution** — large run button, animated progress bar, running-request
   indicator, streaming live logs and a pass/fail/skip/duration summary.
5. **Reports** — historical report table; each row opens a detailed view with
   assertions, failed requests, response-time chart and a pass/fail donut.
6. **CI/CD** — GitHub Actions runs with a horizontal pipeline visualization
   (Checkout → Install → Docker Build → Database Seed → Run Newman → Upload Report)
   and a vertical execution timeline.
7. **Docker Environment** — backend / database / cache containers with health,
   ports, CPU & memory meters, logs and a UI-only restart button.
8. **Settings** — theme switch, environment selector, Postman environment and
   GitHub configuration (persisted to `localStorage`).

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. (optional) configure the future API base URL
cp .env.example .env

# 3. Start the dev server (http://localhost:5173)
npm run dev
```

### Other commands

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run typecheck  # type-check only
```

## Project Structure

```
src/
├── assets/                 # static assets
├── components/
│   ├── ui/                 # shadcn/ui primitives (button, card, table, …)
│   ├── common/             # reusable app components (StatCard, DataTable, …)
│   ├── charts/             # Recharts wrappers (PassFailPie, ResponseTimeLine, …)
│   └── layout/             # Sidebar, TopNav
├── hooks/                  # TanStack Query hooks (useDashboard, useExecution, …)
├── layouts/                # DashboardLayout shell
├── pages/                  # one file per route
├── routes/                 # router + path constants
├── services/               # Axios client + placeholder services
│   └── mock/               # typed mock JSON data
├── types/                  # domain type definitions
├── utils/                  # formatting + constants
├── lib/                    # cn() helper
├── App.tsx                 # providers + router
└── main.tsx                # entry point
```

## Connecting a real backend later

1. Set `VITE_API_BASE_URL` in `.env`.
2. In each file under `src/services/*.service.ts`, replace the `mockDelay(...)`
   resolver with the `apiClient` call shown in the `TODO(backend)` comment.

The hooks, components and pages stay exactly the same.
