# Docker Workflow

The entire stack runs with one command. Docker Compose orchestrates three
services and handles migrations + seeding automatically.

## Services

| Service    | Image / build            | Port  | Notes                                  |
| ---------- | ------------------------ | ----- | -------------------------------------- |
| `db`       | `postgres:16-alpine`     | 5432  | Health-checked; data in `pgdata` volume |
| `backend`  | `./backend/Dockerfile`   | 8080  | Multi-stage; runs migrations + seed on boot |
| `frontend` | `./Dockerfile` (nginx)   | 3000  | Vite build served by nginx             |

## One command

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:8080/api
- Swagger  → http://localhost:8080/api/docs

## Startup ordering (health-gated)

```mermaid
flowchart LR
  db[("db: healthy?")] -->|service_healthy| backend
  backend[("backend: /api/health 200?")] -->|service_healthy| frontend
```

- `db` exposes a `pg_isready` health check.
- `backend` waits for `db` to be healthy, then its entrypoint
  (`docker-entrypoint.sh`) waits for Postgres, runs `prisma migrate deploy`,
  seeds the database, and starts the server. The backend has its own health
  check hitting `/api/health`.
- `frontend` waits for `backend` to be **healthy** before starting.

## Persistence & restart

- PostgreSQL data persists in the named volume `pgdata` across restarts.
- All services use `restart: unless-stopped`.
- Reset the database (fresh migrations + seed):

  ```bash
  docker compose down -v && docker compose up --build
  ```

## Multi-stage backend image

`backend/Dockerfile` builds in a `node:20` stage (installs deps, generates the
Prisma client, compiles TypeScript) and copies only the runtime artifacts +
production dependencies into the final image, keeping it lean.

## Useful commands

```bash
docker compose ps                     # service status
docker compose logs -f backend        # follow backend logs
docker compose exec backend sh        # shell into the backend
docker compose exec db psql -U postgres -d rats   # psql into the database
```
