# Deploying the web app

The target is Vercel for the app and a Supabase Postgres in `ca-central-1`
(Montreal) for the database. `603af3e` settled this, and
[law25-checklist.md](law25-checklist.md) records the reasoning. Supabase is the
one mainstream managed Postgres with a Montreal region, so the personal
information stays in Quebec at rest. Vercel runs Next 16 server components,
image optimization and the Satori `opengraph-image` routes without
configuration, but it has no Canadian function region. The app tier therefore
leaves Quebec, and the s. 17 assessment is still owed before real data goes in.

Neon was the earlier target. It has no Canadian region at all and fixes a
project's region at creation, so choosing it meant choosing the assessment for
the database as well.

The repository is a monorepo. **Vercel's root directory must be `web/`**, not
the repository root.

## Once, before the first deploy

### 1. A database

Create a project at <https://supabase.com> in the `ca-central-1` region,
Canada (Central), which is Montreal. Pick the region at creation; the project
stays where it starts. Copy the **pooled** connection string from the
project's connection panel. The pooler is what keeps a scaled-out deploy from
exhausting the connection limit. The schema bootstrap below takes a
session-level `pg_advisory_lock`, so use the pooler's session mode, which holds
one server connection for the client's whole session.

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
| `DATABASE_URL` | the Supabase **pooled** connection string |
| `AUTH_SECRET` | the generated secret |
| `NEXT_PUBLIC_SITE_URL` | the site's own origin, e.g. `https://astra-antiqua.vercel.app` |

Give Preview its own database rather than pointing it at production, or a
preview deploy writes to real accounts.

**Never set `ASTRA_ALLOW_HTTP` on a deploy.** It drops the `Secure` flag from
the session cookie so the app can be reached over plain HTTP on a LAN. On
anything internet-facing it hands sessions to anyone watching the network.

### 4. Before the first deploy

- The legal pages (`/privacy`, `/confidentialite`, `/terms`, `/conditions`)
  return 404 until `web/src/lib/legal/policyFacts.ts` holds no
  `TODO_SET_BEFORE_LAUNCH` values. The build prints the unset fields. Fill
  them, and write the s. 17 assessment, per
  [law25-checklist.md](law25-checklist.md).

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

Point `DATABASE_URL` at a development Postgres, never the production
project, so development and production run on the same engine:

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
