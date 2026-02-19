# 01. Implementation Plan (Requirements-Driven, Desktop MVP)

## 1. Objective

Implement all agreed requirements from:

- `docs/requirements/03-functional-requirements.md` (`FR-001` to `FR-124`, including grouped IDs)
- `docs/requirements/04-non-functional-requirements.md` (`NFR-000` to `NFR-032`)
- `docs/requirements/planning/10-extended-data-models-and-ux-addendum.md`
- `docs/requirements/ux/05-user-flows.md`
- `docs/requirements/ux/07-kanban-dashboard.md`

This plan defines execution order, dependency gates, and parallel workstreams for multi-team delivery.

## 2. Delivery Sequence (Order + Dependencies)

| Seq | Task ID | Deliverable | Covers | Depends On | Parallelizable | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `T01` | Finalize open product decisions + acceptance criteria | Open questions baseline for all FR/NFR | None | No | **SKIPPED** — pragmatic defaults adopted; open questions resolved as encountered |
| 2 | `T02` | Architecture, data model baseline, Electron app shell, Firebase contracts | `NFR-000`, `NFR-000b`, base for all features | `T01` | No | **DONE** (2026-02-19) |
| 3 | `T03` | Auth, RBAC, workspace security foundation | `FR-025` to `FR-027`, `FR-092`, `FR-094`, `FR-096`, `NFR-008` to `NFR-011`, `NFR-025` | `T02` | Yes | **DONE** (2026-02-19) |
| 4 | `T04` | Core project/task management | `FR-001` to `FR-009`, `FR-071` to `FR-074` | `T02`, `T03` | Yes | **DONE** (2026-02-19) |
| 5 | `T05` | Project organization and taxonomy | `FR-040` to `FR-043` | `T04` | Yes | **DONE** (2026-02-19) |
| 6 | `T06` | Milestones + project progress metrics | `FR-010` to `FR-012` | `T04` | Yes | **DONE** (2026-02-19) |
| 7 | `T07` | Advanced task model (subtasks + dependencies) | `FR-050` to `FR-053` | `T04` | Yes | **DONE** (2026-02-19) |
| 8 | `T08` | Kanban board modes (project + monthly) | `FR-021` to `FR-024`, `FR-088` to `FR-091` | `T04`, `T06`, `T07` | Yes | **DONE** (2026-02-19) |
| 9 | `T09` | Collaboration and comment foundation | `FR-013` to `FR-015`, `FR-069` | `T03`, `T04` | Yes | **DONE** (2026-02-19) |
| 10 | `T10` | Portfolio views and reporting | `FR-028`, `FR-030` to `FR-033` | `T04`, `T05`, `T06` | Yes | **DONE** (2026-02-19) |
| 11 | `T11` | Search and navigation views | `FR-019`, `FR-020`, `NFR-003` | `T04`, `T05`, `T10` | Yes | **DONE** (2026-02-19) |
| 12 | `T12` | Desktop-native capabilities | `FR-016` to `FR-018`, `FR-060` to `FR-063`, `NFR-019` | `T03`, `T04`, `T10` | Yes | **DONE** (2026-02-19) |
| 13 | `T13` | Attachments and data portability | `FR-064` to `FR-067`, `NFR-013`, `NFR-021`, `NFR-023` | `T03`, `T04` | Yes | **DONE** (2026-02-19) |
| 14 | `T14` | Rich content + multi-window desktop workflow | `FR-068`, `FR-070`, `NFR-015`, `NFR-017`, `NFR-022` | `T04`, `T08`, `T11` | Yes | **DONE** (2026-02-19) |
| 15 | `T17` | Global calendar planning view | `FR-075` to `FR-079` | `T04`, `T10`, `T11` | Yes | **DONE** (2026-02-19) |
| 16 | `T18` | Project bug tracking module | `FR-080` to `FR-087` | `T03`, `T04` | Yes | **DONE** (2026-02-19) |
| 17 | `T19` | Identity UX + workspace lifecycle + invite model | `FR-093`, `FR-095`, invite lifecycle from `FR-094`, addendum Invite model (2.13) | `T03`, `T09` | Yes | **DONE** (2026-02-19) |
| 18 | `T20` | Extended data models + validation guardrails + entity links | `FR-101` to `FR-109`, `NFR-027`, addendum Entity Link model (2.12), validation rules 9-12 | `T04`, `T05`, `T06`, `T07`, `T09`, `T13`, `T18` | Yes | **DONE** (2026-02-19) |
| 19 | `T23` | Activity trail and change-driven notifications | `FR-097` to `FR-100`, `NFR-026` | `T09`, `T10`, `T12`, `T18`, `T20` | Yes | **DONE** (2026-02-19) |
| 20 | `T21` | Desktop UX completeness + user preferences model | `FR-110` to `FR-117`, `NFR-024`, `NFR-030`, `NFR-031`, addendum User Preferences model (2.14) | `T03`, `T10`, `T11`, `T12`, `T14`, `T19`, `T23` | Yes | **DONE** (2026-02-19) |
| 21 | `T22` | Scale workflows + operational limits + recurring task model | `FR-118` to `FR-124`, `NFR-028`, `NFR-029`, `NFR-032`, addendum Recurring Task Definition model (2.11) | `T07`, `T08`, `T10`, `T11`, `T13`, `T18`, `T20` | Yes | **DONE** (2026-02-19) |
| 22 | `T15` | Non-functional hardening (performance, offline reliability, accessibility, observability) | `NFR-001` to `NFR-007`, `NFR-012`, `NFR-014`, `NFR-016`, `NFR-018` | `T04` to `T14`, `T17`, `T18`, `T19`, `T20`, `T21`, `T22`, `T23` | Partial | **DONE** (2026-02-19) |
| 23 | `T16` | Release readiness (packaging, signing, QA/UAT) | `NFR-020`, end-to-end validation across all FR/NFR | `T15` | No | **DONE** (2026-02-19) |

## 3. Parallel Workstreams

## Workstream A: Platform and Data

1. `T02`, `T03` platform foundation and security contracts.
2. `T04`, `T06`, `T07` core project/task/milestone domain services.
3. `T18`, `T20` bug + extended schema + validation rules.
4. `T10`, `T11` aggregation and search indexing.
5. `T13`, `T22` attachment/storage/scale limits.
6. `T15` reliability, conflict handling, telemetry hardening.

## Workstream B: Desktop UX

1. Base layout and navigation after `T02`.
2. Project/task/folder experiences (`T04`, `T05`) in parallel with backend.
3. Kanban and advanced task UX (`T07`, `T08`) after task contracts stabilize.
4. Portfolio/search/calendar views (`T10`, `T11`, `T17`) in parallel.
5. Collaboration and identity UX (`T09`, `T19`) in parallel with auth contracts.
6. Desktop polish and consistency (`T12`, `T14`, `T21`) in parallel.

## Workstream C: Notifications, Activity, and Cross-Entity Integrations

1. Build activity event stream and audit data contracts from `T20`.
2. Implement change-driven notifications and inbox in `T23` (`FR-097` to `FR-100`).
3. Wire bug metrics/calendar links and bug-task linking (`FR-102` to `FR-104`) using `T18`, `T20`, and `T23`.

## Workstream D: Quality Engineering

1. Build requirement-to-test matrix after `T01`.
2. Add module-level integration tests per task (`T04` to `T14`, `T17` to `T23`) as features land.
3. Run offline/online sync, performance, accessibility, scale, and release validation in `T15` and `T16`.

## 4. Dependency Rules (Parallel Execution Callouts)

1. `T02` blocks all feature module work.
2. `T03` is the auth/security gate for all collaboration, invitation, and permission-sensitive flows.
3. `T04` is the primary domain gate for `T05` to `T14`, `T17`, `T18`, and `T20`.
4. `T07` must complete before finalizing Kanban status transitions in `T08` and before scale reordering in `T22`.
5. `T10` must complete before `T12` (desktop-native overdue/badge counts require portfolio aggregation) and before finalizing cross-project dashboard, calendar, and global notification routing with `T11`.
6. `T20` is the data-contract gate for `T23`, `T21`, and `T22` because limits, validation, and cross-entity link semantics are defined there.
7. `T23` must complete before finalizing notification inbox routing and deep-link behavior in `T21`.
8. `T19` must complete before finalizing settings/account UX paths in `T21`.
9. `T15` cannot close until all functional modules (`T04` to `T14`, `T17` to `T23`) are complete.
10. `T16` cannot start until `T15` passes NFR acceptance checks.

## 5. Requirement Traceability by Task

| Requirement Group | Implemented In |
| --- | --- |
| `FR-001` to `FR-009` | `T04` |
| `FR-010` to `FR-012` | `T06` |
| `FR-013` to `FR-015` | `T09` |
| `FR-016` to `FR-018` | `T12` |
| `FR-019` to `FR-020` | `T11` |
| `FR-021` to `FR-024` | `T08` |
| `FR-025` to `FR-027` | `T03` |
| `FR-028` | `T10` |
| `FR-030` to `FR-033` | `T10` |
| `FR-040` to `FR-043` | `T05` |
| `FR-050` to `FR-053` | `T07` |
| `FR-060` to `FR-063` | `T12` |
| `FR-064` to `FR-067` | `T13` |
| `FR-068` (Markdown descriptions) | `T14` |
| `FR-069` (Markdown comments) | `T09` |
| `FR-070` (Multi-window) | `T14` |
| `FR-071` to `FR-074` | `T04` |
| `FR-075` to `FR-079` | `T17` |
| `FR-080` to `FR-087` | `T18` |
| `FR-088` to `FR-091` | `T08` |
| `FR-092` to `FR-096` | `T03`, `T19` |
| `FR-097` to `FR-100` | `T23` |
| `FR-101` to `FR-109` | `T20` |
| `FR-110` to `FR-117` | `T21` |
| `FR-118` to `FR-124` | `T22` |
| `NFR-000`, `NFR-000b` | `T02` |
| `NFR-001` to `NFR-004` | `T08`, `T11`, `T15` |
| `NFR-005` to `NFR-007` | `T02`, `T15` |
| `NFR-008` to `NFR-011` | `T03`, `T15` |
| `NFR-012` to `NFR-013` | `T13`, `T15` |
| `NFR-014` to `NFR-017` | `T12`, `T14`, `T15` |
| `NFR-018` to `NFR-019` | `T12`, `T15` |
| `NFR-020` to `NFR-023` | `T13`, `T14`, `T16` |
| `NFR-024` to `NFR-025` | `T03`, `T21` |
| `NFR-026` to `NFR-027` | `T20`, `T23` |
| `NFR-028` to `NFR-029` | `T22`, `T15` |
| `NFR-030` to `NFR-031` | `T21`, `T15` |
| `NFR-032` | `T13`, `T22`, `T16` |

## 6. Suggested Sprint Batching

1. Sprint 1: `T01`, `T02`, `T03`
2. Sprint 2: `T04`, `T05`, `T06`
3. Sprint 3: `T07`, `T09`, `T13`, `T18`
4. Sprint 4: `T08`, `T10`, `T19`
5. Sprint 5: `T11`, `T12`, `T14`, `T17`, `T20`
6. Sprint 6: `T23`, `T21`, `T22`
7. Sprint 7: `T15`, `T16`

> **Note**: `T13` and `T18` are moved to Sprint 3 (earliest possible given dependencies on `T03` + `T04`). `T19` is moved to Sprint 4 (earliest possible given dependencies on `T03` + `T09`). This reduces the overall schedule from 8 sprints to 7.

## 7. Exit Criteria Before Build Start

> **Status**: T01 was skipped in favor of pragmatic defaults. T02 completed on 2026-02-19, satisfying the Foundation Gate. Build has started.

1. ~~Open MVP decisions are resolved or explicitly deferred.~~ SKIPPED — defaults adopted; resolved incrementally.
2. ~~Data model, Firebase rules, and API contracts are signed off.~~ DONE — 17 Zod schemas published in `src/shared/schemas/`.
3. Definition of done exists for every `Txx` task. DONE — acceptance checklists in sections 8–12.
4. Requirement-to-test mapping is approved. IN PROGRESS — baseline schema tests created; coverage grows per task.
5. ~~Parallel team ownership is assigned for `Workstream A` to `Workstream D`.~~ N/A — solo AI-assisted development; sequential execution.

## 7b. T02 Completion Evidence (2026-02-19)

| Criterion | Evidence |
| --- | --- |
| `NFR-000`: Electron + React app launches | `electron-vite dev` starts Electron shell with React renderer |
| `NFR-000b`: Firebase connected | Firebase app, Firestore (with persistent offline cache), and Auth instances initialize |
| `NFR-005`: Offline persistence enabled | Firestore configured with `persistentLocalCache` + `persistentMultipleTabManager` |
| `NFR-017`: Dark/Light theme tokens | Tailwind CSS v4 `@theme` block with light/dark mode CSS variables |
| Module boundaries defined | 14 feature module directories in `src/renderer/src/features/` |
| Schema contracts published | 17 Zod schemas in `src/shared/schemas/` with types, create schemas, and validation refinements |
| Validation limits defined | All addendum section 3 limits in `src/shared/constants/validation.ts` |
| Multi-window skeleton | `src/main/windows.ts` with window ID tracking; New Window menu item |
| Native menu bar | macOS menu bar with File/Edit/View/Window/Help menus |
| Build pipeline | `electron-vite build` produces main + preload + renderer bundles |
| Test infrastructure | Vitest configured; 31 baseline tests passing (schemas + constants) |
| App shell navigable | HashRouter with lazy-loaded routes; sidebar navigation to all views |

### T02 Technical Decisions Made

| Decision | Choice | Rationale |
| --- | --- | --- |
| Build tooling | `electron-vite` + `electron-builder` | Purpose-built for Electron multi-process; Forge Vite plugin still experimental |
| State management | Zustand (UI state) + Firestore listeners (server state) | Firestore offline cache IS the server state; Zustand handles UI-only concerns |
| UI framework | shadcn/ui + Tailwind CSS v4 | Ownable components, correct accessibility via Radix, CSS-first theme config |
| Routing | React Router v7 with HashRouter | Required for Electron `file://` protocol; MemoryRouter alternative rejected for URL shareability |
| Validation | Zod schemas in `src/shared/` | Runtime validation + TypeScript type inference from single source |
| Testing | Vitest + Playwright | Native Vite ecosystem; Playwright has first-class Electron support |
| Target platform | macOS first | Developer environment; Windows/Linux builds configured but untested |

## 8. T20 Acceptance Checklist (Data + Validation + Cross-Entity)

1. Extended entity schemas are implemented per `docs/requirements/planning/10-extended-data-models-and-ux-addendum.md` (sections 2.1–2.14).
2. Project/task/bug validation guardrails are enforced in both client and backend paths (`FR-106` to `FR-109`, `NFR-027`).
3. Comments are consistently supported for tasks, bugs, and projects (`FR-101`).
4. Bug-to-task links use Entity Link model (addendum 2.12) and are validated and queryable (`FR-104`).
5. Folder nesting depth, trash auto-purge policy, entity link limits, and Kanban sort-order storage are enforced per addendum validation rules 9–12.

## 9. T19 Acceptance Checklist (Identity UX + Workspace Lifecycle)

1. Profile management screen allows editing display name, avatar, and email (`FR-093`).
2. Account deletion flow enforces ownership transfer or archive handling before completion (`FR-095`).
3. Invite entity (addendum 2.13) is implemented with token generation, expiration, and revocation (`FR-094`, `NFR-025`).
4. Invite acceptance creates a Workspace Member record (addendum 2.2) and transitions invite status to `Accepted`.
5. Pending, expired, and revoked invites are retained for audit.

## 10. T23 Acceptance Checklist (Activity + Notifications)

1. Entity mutations generate activity events with actor/action/entity/timestamp metadata (`FR-097`).
2. Users can query activity history with scope and filters (`FR-098`).
3. Change-driven notification triggers are produced across tasks, bugs, projects, comments, and invites (`FR-099`).
4. Notification inbox/history supports read/unread and deep links (`FR-100`).

## 11. T21 Acceptance Checklist (Desktop UX Completeness)

1. Undo/redo is available for supported create/update/delete/move operations (`FR-110`, `NFR-031`).
2. Settings screen exists and exposes all required configuration groups (`FR-111`).
3. Settings screen reads/writes User Preferences entity (addendum 2.14) for theme, default view, notification toggles, and sidebar state.
4. Sync state/conflict/error/loading/empty/onboarding contracts are implemented (`FR-112` to `FR-115`, `NFR-030`).
5. Menu bar and platform-specific shortcuts/behavior follow desktop conventions (`FR-116`, `FR-117`, `NFR-024`).

## 12. T22 Acceptance Checklist (Scale and Operations)

1. Bulk actions and quick-add are available with required constraints (`FR-118`, `FR-119`, `NFR-029`).
2. Recurring Task Definition model (addendum 2.11) is implemented; recurrence CRUD, instance generation, and `recurrence_id` back-reference on tasks work correctly (`FR-120`).
3. Kanban custom within-column ordering uses `kanban_sort_order` field and persists across refresh and sync (`FR-121`).
4. Trash/restore/purge lifecycle exists for soft-deleted entities with 30-day auto-purge policy (`FR-122`, addendum validation rule 10).
5. Pagination/virtualization and quota visibility meet scale requirements (`FR-123`, `FR-124`, `NFR-028`, `NFR-032`).
