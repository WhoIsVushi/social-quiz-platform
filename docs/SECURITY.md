# Security considerations

## Implemented controls

- Better Auth handles password hashing and persistent database sessions; cookies are HttpOnly, SameSite=Lax and Secure in production. Session IP/user-agent persistence is disabled for data minimization.
- Request bodies are size-bounded, Zod-validated, length-limited and rendered as React text. No `dangerouslySetInnerHTML`, raw untrusted SQL strings or client-provided score is used.
- Route mutations require an exact configured Origin and JSON content type. Authentication uses Better Auth's separate origin/CSRF protections. External redirect destinations are not accepted by application navigation.
- Owner-scoped queries protect drafts, editing, publication, deletion, analytics, reports and moderation. Unrelated users receive generic missing-resource responses.
- Public question serialization is an explicit allowlist. Private correct-answer data never enters a quiz player's payload. Explanations are available only after completion when enabled.
- Result access is authorized with a 256-bit random HttpOnly guest cookie (stored as an HMAC) or the owner's session. Guessing/learning an attempt ID alone does not grant result access. Sensitive pages have noindex metadata.
- Shared PostgreSQL atomic rate buckets protect creation, publication, guest starts/submissions, reports and authentication. Per-email keyed hashes and global ceilings apply even without a proxy. Better Auth has its own database-backed authentication limits.
- Transaction-safe scoring, unique answer rows, immutable question versions and conditional completion protect result integrity and idempotence.
- Frame denial, content-type protection, referrer policy, restricted browser permissions and a self-only CSP are configured. Production emits HSTS; deploy exclusively over HTTPS.
- Structured application error events log request IDs and error codes, not request bodies, emails, passwords, reset tokens or IPs. Provider/platform logs need their own review.
- Account and quiz deletion cascades through associated records. A retention script cleans attempts, expired sessions, verification tokens, rate buckets and reports.

## Operational requirements

Use a least-privileged server-side database identity. For Supabase, use the server database connection, never browser-side access to quiz answer tables. If the schema is exposed through Supabase APIs, enable appropriate RLS/revoke API roles: the app uses Prisma and does not rely on Supabase anonymous table access. Do not expose the service role key or `DATABASE_URL` to clients.

Set `TRUST_PROXY=true` only when your proxy reliably strips and replaces client-supplied `x-forwarded-for`. The application otherwise avoids trusting spoofable IP headers. Configure upstream request-size, connection and DDoS controls appropriate to your deployment; application rate limiting cannot replace those controls.

Use HTTPS, a long unique authentication secret, separate production and test databases, verified email delivery and managed backups. Rotate a compromised auth secret; doing so also invalidates guest-cookie HMACs and access to historical guest result details from those cookies. Test restore procedures before launch.

Run `npm run db:cleanup` daily through a private scheduled job with the database secret. No public administrative cleanup endpoint is provided. Restrict production log access and configure log retention at the hosting provider.

## Explicit limits

- Guests are identified by browser cookies, not identity verification. Clearing cookies or switching browsers can bypass replay restrictions. This is deliberately not fingerprinted.
- Global rate ceilings can cause shared throttling under legitimate high traffic. Tune them for deployment scale and place production-grade abuse controls upstream.
- The CSP permits inline scripts/styles required by this implementation of Next.js and theme initialization. A nonce-based CSP is a possible hardening step; do not represent the current policy as a strict nonce policy.
- Native share and clipboard availability depend on browser support and secure context. Fallbacks are provided.
- No third-party penetration test or WCAG audit has been performed. Included automated checks are evidence for covered flows, not a security certification.
- Privacy/terms drafts require an identified operator, contact and request process, provider/transfer analysis, age/consent policy and legal review before public launch.
