# Deploying the web app

The target is Vercel for the app and Neon for the database. Vercel runs Next 16
server components, image optimization and the Satori `opengraph-image` routes
without configuration; Neon is Postgres with a free tier and branching, which
gives local development a real database instead of a second storage engine to
keep in step.

The repository is a monorepo. **Vercel's root directory must be `web/`**, not
the repository root.

## Once, before the first deploy

### 1. A database

Create a project at <https://neon.tech> and copy the **pooled** connection
string, the host with `-pooler` in it. That endpoint fronts Postgres with
PgBouncer, which is what keeps a scaled-out deploy from exhausting the
connection limit.

Nothing else is needed. The app creates its own tables on first use, under an
advisory lock so several instances starting at once cannot race.

### 2. A session secret

`AUTH_SECRET` signs the session cookie. Generate one:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

The app refuses to start in production without it, and requires at least 16
characters.

### 3. Vercel

Import the repository, set the root directory to `web/`, and set these
environment variables for Production and Preview:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | the Neon **pooled** connection string |
| `AUTH_SECRET` | the generated secret |
| `NEXT_PUBLIC_SITE_URL` | the site's own origin, e.g. `https://astra-antiqua.vercel.app` |

Give Preview its own Neon branch rather than pointing it at production, or a
preview deploy writes to real accounts.

**Never set `ASTRA_ALLOW_HTTP` on a deploy.** It drops the `Secure` flag from
the session cookie so the app can be reached over plain HTTP on a LAN. On
anything internet-facing it hands sessions to anyone watching the network.

## Environment variables in full

| Variable | Required | What it does |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres for accounts, charts and the wait list. Without it the app throws on the first query. |
| `AUTH_SECRET` | yes in production | Signs the session cookie. 16 characters minimum. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Absolute URLs in metadata, share cards and the sitemap. |
| `ASTRA_ALLOW_HTTP` | no | LAN testing only. Drops `Secure` from the session cookie. Never in production. |
| `WAITLIST_STORE` | no | `noop` logs wait-list entries instead of storing them. |
| `WAITLIST_FILE` | no | Overrides the wait list to a JSON file. Takes priority over `DATABASE_URL`, so leave it unset on a deploy. |

## Local development

Point `DATABASE_URL` at a Neon branch, which costs nothing and keeps
development and production on the same engine:

```bash
DATABASE_URL=postgres://... pnpm dev
```

The tests need no database of their own. `pnpm test:db` starts a throwaway
Postgres (PGlite, which is Postgres compiled to WebAssembly, behind the real
wire protocol) and runs the whole suite against it:

```bash
pnpm test:db
```

`pnpm test` also works and skips the database tests, naming the reason.

## What the deploy does not carry

`web/data/` holds a local SQLite file and a local wait-list JSON from before
the move to Postgres. Both are gitignored and neither is read any more. They
stay on the development machine; production starts empty.
