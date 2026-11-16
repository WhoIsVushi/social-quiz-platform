# Architecture

## Boundaries

`src/app` contains App Router server-rendered pages, metadata, error boundaries, and HTTP handlers. Client components under `src/components` handle forms, transitions, local recovery, sharing, and interaction. Shared validation is in `src/lib/validation`; the database is accessed through a single reusable Prisma client. `src/server` is marked server-only and owns publication, attempt integrity, ranking and aggregate queries.

Better Auth owns password hashing, session creation, CSRF/origin protection for authentication endpoints, verification and reset tokens. Authentication data resides in PostgreSQL. Every protected page and every protected mutation validates a database-backed session. Client navigation and cookie presence are never sufficient authorization.

## Data model

- User → sessions, authentication accounts, owned quizzes; cascading account deletion.
- Quiz → mutable draft JSON, title/category metadata, publication state, visibility and optimistic revision counter.
- QuizVersion → immutable public metadata/settings snapshot and normalized ordered Question/AnswerOption records. Every publication creates new unpredictable question and option IDs.
- QuizAttempt → immutable version reference, nickname, HMAC guest identifier, persisted randomized question order, completion state and server-calculated summary.
- AttemptAnswer → chosen option and the server-evaluated correctness; unique `(attemptId, questionId)` prevents duplicate rows.
- QuizTemplate → curated library records seeded independently of user activity. No example choice is assumed correct.
- RequestBucket/RateLimit → shared database abuse controls across server instances.
- Report → bounded content/nickname reports visible only to the quiz owner through analytics.

The active-version foreign key points at the newest published version. Previous versions remain attached to historical and in-progress attempts. Draft edits are invisible to public players until published. Visibility/state are always checked on the current Quiz so archiving or making a quiz private cuts off public access.

## Publication and attempts

1. Zod validates a draft at the HTTP boundary; object ownership is checked independently.
2. Saving uses the expected revision and atomically increments it. Stale writes return a conflict.
3. Publication validates configured question counts and one correct answer per question, locks via a conditional revision update, creates the version/questions/options and switches the active version in one transaction.
4. Starting an attempt validates visibility and nickname. A transaction-scoped advisory lock serializes starts for the same guest and quiz. Replay-disabled in-progress attempts resume their original version.
5. Only the allowlisted public question representation reaches the browser. Server answer flags, explanations and answer keys are omitted.
6. Submitting validates the complete unique question set and each selected option's membership against the attempt's version. Score is `Math.round(correctCount / totalQuestions * 100)`.
7. A conditional STARTED → COMPLETED update acts as the submission lock. Answers and summary commit atomically. Concurrent duplicate submissions yield the same saved result.
8. Result details require the originating HttpOnly guest cookie or the owner's session. Public leaderboards expose only nickname (optionally masked), score, date and rank.

Completed results use settings from their published revision for historical consistency. Current quiz visibility and archive status still gate access. Turning score visibility off also suppresses answer review and public ranking for that version. Hidden leaderboard entries remain visible to their owner and participant.

## Ranking and analytics

Ranking sorts score descending, correct count descending, completion time ascending, then internal ID ascending as a deterministic last tie break. The same ordering is used for public tables and owner analytics. Internal IDs are not returned in the public leaderboard. Duplicate replays are independent entries and are labeled as such.

Analytics run bounded owner-scoped SQL aggregates and paginated ORM reads. A distinct, case-insensitive nickname count is explicitly approximate and does not claim verified unique people. Completion rate divides completed attempts by actual started-attempt records. Daily aggregation uses Europe/Istanbul. Per-question difficulty targets current version IDs; overall scores cover all versions.

## Browser state

The HttpOnly guest cookie lasts 30 days. A localStorage document contains only version number, attempt ID, selected public option IDs and navigation index. It contains no nickname or correct answer key. Recovery calls the server to verify ownership and reload the original version. Local storage is optional; storage failure does not affect authoritative server submission. A completed attempt's recovery document is removed.

## UI

Semantic CSS design tokens define both themes. Tailwind is available for utility composition. Button variants follow the shadcn composition pattern using CVA and tailwind-merge; modal accessibility is provided by Radix. No generated component registry or remote font is needed at runtime. Motion and CSS respect reduced motion. The homepage interaction is a labeled demonstration, separate from actual attempts.
