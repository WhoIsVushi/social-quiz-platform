# Delivery status

The application source, Prisma schema and initial migration, template seed, environment example, automated test suites, CI configuration, architecture/security/deployment documentation and editable legal drafts are included.

## Evidence

Verification is run locally against a real PostgreSQL instance created inside `.local/`. Browser workflows use Chromium. The following totals describe the executed local checks; a newly published GitHub workflow has its own run status. Test outputs and screenshots are generated under the gitignored `test-results/` and `playwright-report/` directories.

Local verification on 2026-11-16: 10 unit tests, 5 PostgreSQL integration tests and 3 Playwright scenarios passed. ESLint and strict TypeScript checks passed. `npm audit` reported zero known vulnerabilities after development-tool updates. The Next.js production build passed. This does not claim a production deployment, live email delivery or externally audited security.

The primary browser test covers registration, template selection, correct-answer selection, preview, publication, link copying, a separate mobile guest context, refresh recovery, an 8/10 → 80% score, ranking, owner analytics, entry hiding, result/API access denial, CSRF rejection, logout and login. Additional tests cover narrow viewport widths and light/dark switching; a security flow covers unrelated authenticated owners, malformed/duplicate answers, client-score tampering, score privacy, archive state and cascading account deletion.

## Not configured or not yet verified

- No production hosting, domain, external PostgreSQL or email account has been provisioned. This checkout runs locally with its own generated development secrets.
- Email reset/verification integration is implemented but live delivery requires Resend configuration and an actual mailbox test. No provider credentials were fabricated.
- Privacy and terms are drafts, not legal approval. There is no finished operational data-request desk, administrator moderation UI, age-verification system or abuse-response staffing.
- Retention cleanup exists but needs private scheduling. Provider backups/log retention are outside the application.
- The end-to-end browser suite runs against a development server. The optimized production bundle is built separately; no public deployment has been verified.
- Chromium coverage does not substitute for Safari/Firefox, real iOS/Android, load testing, penetration testing, formal accessibility testing or Core Web Vitals measurement.
- Cover customization uses built-in themes and emoji illustrations. Arbitrary image uploads, social OAuth and a CMS template editor are not implemented.
- Test management is paginated; local search/filter operates on the displayed page of up to 30 tests and is labeled when multiple pages exist. Leaderboards paginate in pages of 20.
- Public visibility allows indexing at page metadata level, while the current robots policy conservatively disallows all quiz paths and the sitemap includes only marketing/legal/template pages. Opt-in public quiz discovery is a future product decision.
- Replay prevention is per browser cookie and is not an identity or anti-cheat guarantee. Replays appear as separate leaderboard entries.
- Results retain the settings of their published revision, while current visibility/archive status controls access. A participant's result detail is accessible only in the originating browser or by the owner; sharing deliberately shares the quiz, not the result capability.
- Templates are curated starting points. Several templates within a category share relevant starter questions; creators can fully edit them and must choose every correct answer.
