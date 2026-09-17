# Storage Doc

Storage Doc is a personal cloud storage app: create an account, then upload,
organize, search, preview, share, and manage your photos, videos, and
documents.

This is being built in phases (see [Roadmap](#roadmap) below). **Phases 1–3 —
auth, file upload/storage, and folders/search/views — are done.** Preview,
favorites, recent activity, trash, sharing, and settings land in later
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
- `MAX_FILE_SIZE_BYTES` — per-upload size limit (defaults to 500 MB)

**frontend/.env** (see `frontend/.env.example`):

- `VITE_API_URL` — where the frontend expects the backend API

No real secrets are committed; `.env` is gitignored and `.env.example` holds
placeholders only.

## Roadmap

- [x] **Phase 1** — project setup, database schema, authentication
      (register/login/logout/forgot-password/reset-password), dashboard shell
- [x] **Phase 2** — file upload, storage integration, file metadata, listing
- [x] **Phase 3** — folders, search, filtering, grid/list views
- [ ] **Phase 4** — preview, favorites, recent files, trash
- [ ] **Phase 5** — sharing, settings, storage analytics
- [ ] **Phase 6** — security hardening, performance, tests, deployment

## Deploying

The frontend and backend deploy to **two different services**, and that's
deliberate, not accidental complexity: the backend writes uploaded files to
local disk, which needs a host with a real persistent server and disk.
Vercel's hosting is serverless with no persistent disk, so it's a great fit
for the frontend (a static Vite build) but not for the backend as currently
built. Splitting them avoids the exact failure mode that made a previous
project painful to deploy: pushing something to a host that silently can't
support what it does, then debugging that after the fact.

- **Frontend → Vercel**
- **Backend + PostgreSQL → Railway** (or Render/Fly.io — anywhere with a
  persistent volume and a long-running Node process)

### 1. Backend + database (Railway)

1. Create a new Railway project from this GitHub repo. When it asks for the
   root/working directory, set it to `backend`.
2. Add a **PostgreSQL** plugin to the project. Railway provisions it and
   exposes a `DATABASE_URL` — reference that variable in your backend
   service rather than retyping it.
3. Add a **Volume** to the backend service, mounted at `/data`. Without this
   step, uploaded files vanish on every redeploy — Railway's own filesystem
   is otherwise just as ephemeral as Vercel's for this purpose.
4. Set these environment variables on the backend service:
   - `DATABASE_URL` — reference the Postgres plugin's variable
   - `NODE_ENV` = `production`
   - `CLIENT_URL` — your Vercel frontend URL (add this **after** step 2
     below, once you know it; redeploy after setting it)
   - `AUTH_SECRET` — a fresh secret, e.g. `openssl rand -base64 32` (don't
     reuse the one in `.env.example` or your local `.env`)
   - `JWT_EXPIRES_IN` = `7d`
   - `COOKIE_NAME` = `storage_doc_token`
   - `STORAGE_DRIVER` = `local`
   - `STORAGE_LOCAL_DIR` = `/data/storage` (inside the volume from step 3)
   - `DEFAULT_STORAGE_LIMIT_BYTES` = `10737418240`
   - `MAX_FILE_SIZE_BYTES` = `524288000`
5. Deploy. Railway runs `npm install` (which also runs `prisma generate` via
   `postinstall`), `npm run build`, then `npm start` — and `npm start`
   already runs `prisma migrate deploy` before starting the server, so the
   database schema is created/updated automatically on every deploy; no
   manual migration step.
6. Copy the backend's public URL (Railway generates one, or attach a custom
   domain) — you'll need it in step 2 below.

### 2. Frontend (Vercel)

1. Import this GitHub repo as a new Vercel project. Set **Root Directory**
   to `frontend`. Vercel auto-detects the Vite framework preset from
   `frontend/package.json` — leave the build/output settings on their
   defaults.
2. Set one environment variable: `VITE_API_URL` = the backend URL from
   Railway step 6 (no trailing slash).
3. Deploy. `frontend/vercel.json` already handles the SPA routing fallback
   (so refreshing on `/dashboard` doesn't 404), so there's nothing else to
   configure.

### 3. Connect the two

Go back to Railway and set `CLIENT_URL` to the Vercel URL from step 2
(e.g. `https://storage-doc.vercel.app`), then redeploy the backend. This is
what makes CORS and the login cookie work — the backend only accepts
cross-site requests/cookies from exactly this origin.

That's it — no other configuration should be needed. If login appears to
"succeed" but you're immediately bounced back to the login page, it's
almost always this last step (`CLIENT_URL` not matching the deployed
frontend's exact URL, including `https://`).

## Testing what's built so far

Every phase so far was verified against the real backend and a real
browser (Playwright), not just typechecked:

- **Auth** — register/login/logout, session cookies, forgot/reset password
  (including one-time token use), cross-user isolation, all via curl.
- **Files** — upload (valid + rejected types, size limits), storage-quota
  enforcement, list/download/rename/favorite/delete, storage accounting
  recalculated from actual file sizes after each change.
- **Folders & search** — nested folder creation, folder-scoped uploads and
  listing, breadcrumbs, rename, cross-folder move (with cycle rejection),
  cascade delete that preserves file content, and search by file/folder
  name with category and favorite filters.

Formal automated tests (Phase 6) are still to come; this has been
verified through scripted end-to-end runs each phase.
