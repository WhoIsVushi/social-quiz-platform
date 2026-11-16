# Social Quiz Platform

A full-stack portfolio project for creating personal quizzes and discovering how well friends know each other. The interface is in Turkish (`tr-TR`), with a responsive layout and light/dark themes.

**Portfolio project · No public service deployment · Screenshots use demonstration data**

[Türkçe özet](README.tr.md) · [Local setup](docs/SETUP.md) · [Architecture](docs/ARCHITECTURE.md) · [Verification and limitations](docs/STATUS.md)

## Overview

A creator chooses or writes questions about themselves, selects the correct answers, and publishes a quiz. Friends can participate with a nickname without creating an account. Scores are calculated on the server, and the creator can view results, rankings, and question-level statistics.

The project includes the complete local workflow, rather than only a set of interface mockups. PostgreSQL persists accounts, quiz drafts, published versions, attempts, and results.

## Screenshots

Screenshots will be added here. The [screenshot guide](docs/screenshots/README.md) lists the suggested views and filenames.

## Features

| Area             | Implemented functionality                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Accounts         | Email/password registration, login/logout, persistent sessions, profile settings, password changes, account deletion |
| Quiz builder     | Five steps: details, questions, customization, preview, publication                                                  |
| Questions        | 5–30 questions, 2–6 choices, one correct answer, duplication, deletion, and reordering                               |
| Templates        | 15 Turkish templates across friendship, relationships, family, and fun                                               |
| Publishing       | Shareable links, immutable published versions, draft editing, duplication, archiving, and deletion                   |
| Guest play       | Nickname-based participation, one question at a time, progress, back/next controls, refresh recovery                 |
| Results          | Server-calculated scores, optional answer review, replay controls, and score reveal                                  |
| Sharing          | Clipboard, native sharing, WhatsApp/Telegram links, downloadable QR codes                                            |
| Dashboard        | Real database statistics, score distribution, daily activity, question difficulty, participant moderation            |
| Privacy controls | Public/unlisted/private quizzes, configurable result visibility, optional masked nicknames                           |
| Interface        | Responsive layouts, light/dark themes, keyboard controls, accessible dialogs, reduced-motion support                 |

Password-reset and email-verification integrations are included but require an email provider. Live delivery has not been verified.

## Technology

- **Application:** Next.js 16 App Router, React 19, strict TypeScript
- **Interface:** Tailwind CSS 4, Radix UI, Lucide, Motion, next-themes
- **Forms and validation:** React Hook Form, Zod
- **Authentication:** Better Auth with database-backed sessions
- **Persistence:** PostgreSQL, Prisma ORM, versioned migrations
- **Testing:** Vitest, Playwright, GitHub Actions

## Engineering highlights

- **Immutable quiz versions:** Editing a draft or publishing a new revision preserves the answer set used by historical attempts.
- **Authoritative scoring:** The server checks that every question appears exactly once and that each selected option belongs to that question. Client-supplied scores are ignored.
- **Transactional submission:** Conditional attempt completion and unique answer rows prevent concurrent duplicate submissions from inflating results.
- **Object-level authorization:** Protected operations query the authenticated owner's records. Result details require the originating guest cookie or the owner's session.
- **Explicit public payloads:** Quiz-loading responses omit correct-answer flags and answer keys.
- **Shared abuse controls:** PostgreSQL-backed limits work across application instances. No fingerprinting or third-party analytics is enabled by default.

See [architecture](docs/ARCHITECTURE.md) and [security considerations](docs/SECURITY.md) for implementation details and practical limits.

## Run locally

Requires **Node.js 22.12+** and npm. A project-local PostgreSQL helper is provided; an existing PostgreSQL installation can also be used.

```bash
npm ci
npm run db:local
```

Keep the database terminal open. On first run, the helper creates a local database, generates development credentials, and writes a gitignored `.env` if one does not exist.

In another terminal:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://127.0.0.1:3000` and create an account through the registration page. The seed adds templates only; it does not create shared login credentials or fabricated participant results.

Full instructions, Docker/external database options, environment variables, and Windows notes are in [Local setup](docs/SETUP.md).

## Verification

Local verification on **16 November 2026**:

| Check                        | Result    |
| ---------------------------- | --------- |
| ESLint                       | Passed    |
| Strict TypeScript            | Passed    |
| Unit tests                   | 10 passed |
| PostgreSQL integration tests | 5 passed  |
| Playwright scenarios         | 3 passed  |
| Production build             | Passed    |

The browser tests cover account creation, publishing, guest play, refresh recovery, scoring, owner analytics, authorization, malformed submissions, score privacy, account deletion, and narrow screens. They run against a development server; the production bundle is built separately. These results do not imply a production deployment, formal accessibility certification, or a penetration test.

```bash
npm run lint
npm run typecheck
npm test
npm run test:integration
npx playwright install chromium
# Keep the application running before the browser suite:
npm run test:e2e
npm run build
```

Use a dedicated local/test database for integration and browser tests.

## Project structure

```text
src/
  app/             Pages, metadata, and route handlers
  components/      Shared UI, quiz flow, and dashboard
  config/          Configurable result messages
  features/        Scoring logic and template catalogue
  lib/             Authentication, database, validation, security
  server/          Publication, attempts, rankings, analytics
prisma/            Schema, migration, and template seed
tests/             Unit, integration, and browser suites
scripts/           Local database and retention tools
docs/              Setup, architecture, security, and status
```

## Scope and limitations

- This repository showcases a portfolio project. It is not currently offered as a public service.
- Accounts, database files, secrets, logs, and test reports from the author's local environment are excluded from the repository.
- Screenshots and example content use demonstration data. They do not represent real users or customer statistics.
- There is no separate administrator role. Quiz owners manage their own quizzes and participant visibility.
- Guest replay limits are browser-based and are not identity verification or an anti-cheat guarantee.
- Cover customization uses built-in themes and emoji; arbitrary image uploads and social OAuth are outside the current scope.
- Email delivery, managed infrastructure, scheduled retention, backups, and operational moderation need separate configuration.
- Legal/privacy pages are editable drafts and are not legally approved documents.

See [delivery status](docs/STATUS.md) for the complete list of limitations. [Deployment notes](docs/DEPLOYMENT.md) describe the architecture's hosting requirements; this repository does not deploy the application automatically.

## Reuse and attribution

No project-wide open-source license has been selected. Third-party libraries retain their respective licenses and attribution requirements.
