# Storage Doc

Storage Doc is a personal cloud storage app: create an account, then upload,
organize, search, preview, share, and manage your photos, videos, and
documents.

This is being built in phases (see [Roadmap](#roadmap) below). **Phase 1 —
project setup, database, authentication, and the dashboard shell — is done.**
File upload, folders, search, sharing, trash, and settings land in later
phases.

## Stack

- **Frontend**: React + Vite + TypeScript, React Router, Tailwind CSS, lucide-react
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL via Prisma
- **File storage**: local disk for now, behind a swappable interface so it
  can move to S3 / Supabase Storage / Cloudinary later without touching the
  rest of the app
- **Auth**: email + password, hashed with bcrypt, sessions as an httpOnly JWT
  cookie

## Project layout

```
backend/    Express API (src/routes, controllers, services, middleware, ...)
frontend/   React app (src/pages, components, contexts, services, ...)
legacy-nextjs/   an earlier Next.js/SQLite prototype of the same idea, kept
                 for reference — no longer developed
```

## Local development

Prerequisites: Node.js 20+, PostgreSQL running locally (this was built
against a local Postgres 16 via Homebrew).

```bash
createdb storage_doc_dev   # once

cd backend
cp .env.example .env       # edit DATABASE_URL if needed
npm install                 # also runs `prisma generate`
npx prisma migrate deploy   # creates the schema
npm run dev                 # http://localhost:4100

# in a second terminal
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5183
```

Open http://localhost:5183, create an account, and you'll land on the
dashboard.

### Ports

The frontend is pinned to **5183** and the backend to **4100** in this
project's `.env` files (rather than Vite/Express's defaults of 5173/4000) to
avoid colliding with other projects that might already be running on your
machine. Change `PORT` (backend) and `server.port` in `frontend/vite.config.ts`
together with `CLIENT_URL`/`VITE_API_URL` if you need different ports.

## Environment variables

**backend/.env** (see `backend/.env.example`):

- `DATABASE_URL` — Postgres connection string
- `PORT`, `NODE_ENV`, `CLIENT_URL` — server + CORS
- `AUTH_SECRET` — signs session JWTs (`openssl rand -base64 32`)
- `JWT_EXPIRES_IN`, `COOKIE_NAME` — session cookie config
- `STORAGE_DRIVER` — `local` (default) or `s3`
- `STORAGE_LOCAL_DIR` — where uploaded files live when using the local driver
- `STORAGE_BUCKET` / `STORAGE_ENDPOINT` / `STORAGE_REGION` /
  `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` — only read when
  `STORAGE_DRIVER=s3`; works with AWS S3, Supabase Storage, or any
  S3-compatible provider
- `DEFAULT_STORAGE_LIMIT_BYTES` — per-user storage quota (defaults to 10 GB)

**frontend/.env** (see `frontend/.env.example`):

- `VITE_API_URL` — where the frontend expects the backend API

No real secrets are committed; `.env` is gitignored and `.env.example` holds
placeholders only.

## Roadmap

- [x] **Phase 1** — project setup, database schema, authentication
      (register/login/logout/forgot-password/reset-password), dashboard shell
- [ ] **Phase 2** — file upload, storage integration, file metadata, listing
- [ ] **Phase 3** — folders, search, filtering, grid/list views
- [ ] **Phase 4** — preview, favorites, recent files, trash
- [ ] **Phase 5** — sharing, settings, storage analytics
- [ ] **Phase 6** — security hardening, performance, tests, deployment

## Testing what's built so far

Backend auth endpoints (`/api/auth/register`, `/login`, `/logout`, `/me`,
`/forgot-password`, `/reset-password`) were verified end-to-end via curl:
registration validation, duplicate-email handling, login/logout, session
cookies, and the full password-reset flow including one-time token use.

The frontend was verified with a Playwright smoke test covering: register →
dashboard → sidebar navigation → settings (showing real profile data) →
logout → protected-route redirect → forgot-password flow, at both desktop
and mobile viewport sizes.
