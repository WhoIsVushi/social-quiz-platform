# Production deployment

The application targets a Node.js Next.js deployment such as Vercel with managed PostgreSQL. It is not a static export and is not adapted to the Cloudflare Workers Sites runtime.

## Prepare services

1. Provision a dedicated PostgreSQL database. Select a region near the application. On Supabase, obtain a server connection string compatible with your network and chosen pooler; reserve a direct/migration connection for schema changes if your pooler requires it.
2. Generate a fresh random production authentication secret, for example `openssl rand -base64 48`. Never reuse the local `.env` or CI secret.
3. Configure a Resend sender and verify its domain. Supply `RESEND_API_KEY` and `MAIL_FROM` in the host's secret settings. Email verification and password reset cannot deliver mail without them.
4. Configure `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the exact HTTPS production origin. Use separate settings/databases for preview environments. The public URL is embedded at build time, so rebuild after changing it.

## Vercel

- Import the repository into your own Vercel account; select the Next.js preset and Node 22.12+.
- Install command: `npm ci` (runs Prisma generation).
- Build command: `npm run build`.
- Store `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` and configured email variables as environment variables. Do not commit them.
- Apply migrations from a trusted release job: `npm run db:migrate`. Run `npm run db:seed` once for templates. The seed is idempotent and can update template copy; it does not create accounts.
- Deploy the application after the migration succeeds. Keep migrations outside parallel function requests.
- Verify register → email verification (if enabled) → login → publish → guest play → results → owner analytics against the deployed URL using disposable fixtures.

For a standard Node server, `npm run build` then `npm start` serves on loopback; put it behind an HTTPS reverse proxy. Override the hostname intentionally if your hosting platform requires binding to all interfaces. Provide process supervision and graceful restarts.

## Database connections

Keep connection counts within the managed service limit and use its supported serverless pooler. Prisma uses parameterized queries. If separate migration/direct URLs are required by your provider, run migrations with `DATABASE_URL` temporarily set to the migration URL inside that release job. Never print a connection URL in logs. The application does not require public database-table APIs.

## Recurring operations

Run `npm run db:cleanup` daily in a private scheduled runner with production database access. The script defaults to 365-day attempt retention, 7-day incomplete attempts, and 90-day report retention. Change `ATTEMPT_RETENTION_DAYS` to your reviewed policy. Schedule and verify database backups and log cleanup independently. No job was scheduled by this local setup.

## Release gates

- Lint, TypeScript, unit tests, real PostgreSQL integration tests, Playwright journey/security/mobile tests and production build pass for the release commit.
- `npm audit` is reviewed; package-lock.json is committed and `npm ci` is used.
- Email reset and verification are tested with a real mailbox on the actual domain.
- Legal copy is reviewed and finalized; operator contact and data request mechanisms exist.
- HTTPS, trusted proxy behavior, security headers, secret handling, database permissions and retention scheduling are checked.
- Backups, restore, monitoring, abuse handling and incident ownership are defined.

The supplied CI workflow runs against disposable PostgreSQL, builds the production bundle and exercises the browser against a development server to keep local HTTP cookie behavior consistent. It does not deploy or certify live production behavior. Production mail delivery, real-device/browser coverage, performance auditing and load testing remain separate release checks.
