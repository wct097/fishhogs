# Claude Code Prompt: Build Fishing Tracker MVP on `develop` Branch

You are acting as a full-stack engineer. Implement a **runnable MVP** of
the "Fishing Tracker App" per `specs/fishing_tracker_spec.md` (v0.3). Do
as much as possible end-to-end in one pass. Favor practicality and
working code over perfection.

------------------------------------------------------------------------

## 0) Git Workflow (IMPORTANT)

-   Create and checkout a new branch: `develop`
-   Perform all work on this branch
-   As you reach milestones, **commit and push** progress with clear
    messages:
    -   `feat(server): FastAPI skeleton + auth`
    -   `feat(app): RN bare init + DB schema + tracking skeleton`
    -   `feat(sync): up/down flow + queue`
    -   `feat(ui): active session, history, session detail`
-   Push after each major milestone so the repo has checkpoints.

------------------------------------------------------------------------

## 1) Project Context & Ground Rules

-   **Spec file:** `specs/fishing_tracker_spec.md` (v0.3) --- production-ready spec with full API/backend definition.
-   **Mobile framework:** React Native **bare** (TypeScript) - chosen for background location support.
-   **Backend:** **FastAPI** (Python) + **PostgreSQL** (SQLite for local dev ok), with endpoints from the spec.
-   **Local only**: mock S3 with local disk "uploads/" and generate fake presigned URLs.
-   **Offline-first**: implement local SQLite on device with sync_queue table, background-safe location sampler, photos capture, catch entries.
-   **Performance targets**: Battery <5%/8h, API <500ms p95, sync <2s for 100 points, app <50MB.
-   **Rate limits**: 100 req/min per user, 500 items/batch, 5MB max photo.
-   **Keep scope to MVP**: working start/stop, 5-min GPS breadcrumb storage, photo capture, manual sync, auth (login/register/refresh).

------------------------------------------------------------------------

## 2) Repo Setup

-   Monorepo layout:

```{=html}
<!-- -->
```
    /app/     # React Native bare app (TypeScript)
    /server/  # FastAPI backend (Python)
    /specs/   # contains fishing_tracker_spec.md
    /scripts/ # dev scripts
    /docs/

Add root README with quickstart.

------------------------------------------------------------------------

## 3) Backend Tasks

-   Scaffold FastAPI app with routers: auth, sync, photos.
-   SQLAlchemy models + Alembic migrations for: users, sessions,
    track_points, photos, catches.
-   JWT auth (login, register with email verification, refresh, password reset).
-   Error codes: 4001 (invalid sync token), 4002 (conflict), 4003 (photo too large), 5001 (DB unavailable).
-   `/sync/up` and `/sync/down` endpoints with LWW merge and tombstones.
-   Photo presigned URL mock + `/photos/upload` multipart handler.
-   Static file serving for photos.
-   Enforce rate limits and batch caps.

------------------------------------------------------------------------

## 4) Mobile App Tasks

-   Init bare RN TS project in `/app`.
-   Add libs: `react-native-sqlite-storage` (or `react-native-quick-sqlite`), `react-native-fs`,
    `react-native-vision-camera`, `@react-native-community/netinfo`,
    `react-native-permissions`, `react-native-geolocation-service`,
    `zustand` or React Context, `@tanstack/react-query`, `uuid`.
-   Native setup: iOS background modes, Android foreground service +
    notification channel.
-   Implement SQLite schema (sessions, track_points, photos, catches, sync_queue).
    ```sql
    CREATE TABLE sync_queue (
      id INTEGER PRIMARY KEY,
      entity_type TEXT,
      entity_id TEXT,
      operation TEXT,
      retry_count INTEGER,
      created_at TIMESTAMP
    );
    ```
-   Tracking service: record 1 fix per 5 min window, background safe.
-   Photo capture service: save image, record lat/lon + ts.
-   Sync service: push/pull with API, apply LWW, retry failed uploads.
-   UI screens: Home, ActiveSession, AddCatch, SessionDetail, History,
    Settings, Auth.

------------------------------------------------------------------------

## 5) Milestones (Commit & Push at Each)

1.  **Backend skeleton** (FastAPI up with auth + DB migrations).\
    Commit: `feat(server): FastAPI skeleton + auth`\
2.  **Mobile init** (RN bare app + DB schema + tracking skeleton).\
    Commit: `feat(app): RN bare init + DB schema + tracking skeleton`\
3.  **Sync flow** (client sync queue + server sync endpoints working).\
    Commit: `feat(sync): up/down flow + queue`\
4.  **Basic UI** (start/stop session, photo, catch, history).\
    Commit: `feat(ui): active session, history, session detail`

Push after each commit.

------------------------------------------------------------------------

## 6) Acceptance Checklist

-   Start session saves GPS fix every \~5 min until stopped (best-effort
    in background).
-   Photos + catches tied to sessions, visible in Session Detail.
-   Works offline; later syncs deltas with server, no duplicates.
-   Auth flows: register, login, refresh, reset password.
-   Android foreground service + iOS location indicator shown during
    tracking.
-   README documents backend + app run steps.

------------------------------------------------------------------------

## 7) Key Architecture Reminders

-   **Sync state machine**: Idle → Queueing → Uploading → Conflict → Resolved → Synced
-   **Conflict resolution**: Last Write Wins by `last_modified_at`, tombstones beat updates
-   **GPS fallback**: If denied mid-session → stop tracking gracefully, allow manual session entry
-   **Storage caps**: Local DB 200MB FIFO, Photo cache 1GB
-   **Photo flow**: Compress to <5MB → request presigned URL → upload → update sync status

------------------------------------------------------------------------

## 8) Delivery

-   Ensure both backend and app run locally.
-   Provide final run commands in README.
-   Document any platform-specific setup (Xcode, Android Studio).
-   Leave TODOs for non-MVP polish (offline maps, social features, analytics).

------------------------------------------------------------------------

## 9) Important Notes from Previous Session

-   Technology decisions finalized (React Native bare + FastAPI + PostgreSQL)
-   Spec v0.3 is production-ready with complete API examples
-   All project documentation updated with current architecture
-   See `SESSION_HANDOFF.md` for additional context if needed

------------------------------------------------------------------------

**Now build the MVP on the `develop` branch and commit/push as you go.**
