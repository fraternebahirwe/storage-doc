# Storage Doc

A simple app for storing and retrieving your pictures, videos, and documents.
Each person signs up for their own account and can upload, view, download,
and delete their own files.

## Stack

- [Next.js](https://nextjs.org) (App Router) for the frontend and API routes
- [Auth.js / NextAuth](https://authjs.dev) (credentials + password) for accounts
- [Prisma](https://www.prisma.io) + SQLite for user and file metadata
- Uploaded files are written to a local folder on disk (`UPLOAD_DIR`)

## Local development

```bash
npm install          # also generates the Prisma client
npx prisma migrate deploy   # creates prisma/dev.db (already done once for you)
npm run dev
```

Open http://localhost:3000. Create an account, then upload files from the
dashboard.

Config lives in `.env` (see `.env.example`):

- `DATABASE_URL` — SQLite file path
- `UPLOAD_DIR` — where uploaded files are stored on disk
- `AUTH_SECRET` — random secret used to sign session tokens

## Deploying

This app stores files on **local disk**, so it needs to run somewhere with a
**persistent volume** attached (the disk must survive restarts/redeploys) —
for example Railway or Render with a mounted volume, or a VPS/Docker host.
Plain Vercel-style serverless hosting will NOT work, because its filesystem
is ephemeral.

Steps on any host with a persistent disk:

1. Set `DATABASE_URL` and `UPLOAD_DIR` to paths inside the persistent volume
   (e.g. `/data/dev.db` and `/data/storage`).
2. Set a real `AUTH_SECRET` (`openssl rand -base64 32`).
3. Run `npm install && npm run build`.
4. Run `npm run migrate` (applies Prisma migrations) once per deploy.
5. Run `npm start`.

## Project layout

- `src/app/(login|register)` — auth pages
- `src/app/dashboard` — the file manager UI
- `src/app/api/files` — list/upload files (`GET`/`POST`)
- `src/app/api/files/[id]` — view/download/delete a single file
- `src/app/api/register` — account creation
- `src/lib/auth.ts` — Auth.js config (credentials provider)
- `src/lib/storage.ts` — reads/writes uploaded files on disk
- `src/proxy.ts` — protects `/dashboard` behind login (Next.js 16's renamed
  `middleware`)
