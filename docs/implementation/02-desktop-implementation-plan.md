# 02. Desktop Implementation Plan (Aligned Task Model)

## 1. Objective

Execute the desktop MVP using the same task model as `docs/implementation/01-implementation-plan.md`:

- Task sequence: `T01` to `T23`
- Functional scope: `FR-001` to `FR-124` (grouped ranges)
- Non-functional scope: `NFR-000` to `NFR-032`

## 2. Technical Strategy (Finalized in T02)

1. Desktop runtime: Electron 34 + React 19 + TypeScript 5.7.
2. Build tooling: `electron-vite` 3 (Vite-based multi-process bundler) + `electron-builder` 25 for packaging.
3. Data and auth: Firebase 11 (Authentication + Firestore with `persistentLocalCache` offline persistence).
4. State management: Zustand 5 (UI state) + Firestore `onSnapshot` listeners (server state).
5. UI framework: shadcn/ui (Radix primitives) + Tailwind CSS 4 (CSS-first theme configuration).
6. Routing: React Router 7 with `HashRouter` (required for Electron `file://` protocol).
7. Validation: Zod 3 schemas in `src/shared/schemas/` — single source for runtime validation and TypeScript types.
8. Testing: Vitest 3 (unit/integration) + Playwright (Electron E2E).
9. Data contracts: 17 entity Zod schemas from `planning/10-extended-data-models-and-ux-addendum.md`.
10. Target platform: macOS first (macOS-only for development; Windows/Linux build configs present but untested).

## 3. Delivery Sequence (Aligned)

| Seq | Task ID | Desktop Deliverable | Key Output | Depends On | Parallelizable | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `T01` | Product and acceptance lock | Final MVP decisions + testable acceptance criteria | None | No | **SKIPPED** |
| 2 | `T02` | Desktop foundation setup | Electron shell, app architecture, schema/contracts | `T01` | No | **DONE** (2026-02-19) |
| 3 | `T03` | Identity and authorization foundation | Auth, RBAC policy, workspace security rules, secure token lifecycle | `T02` | Yes | Pending |
| 4 | `T04` | Core project/task module | Project/task CRUD baseline plus required fields and date validation rules | `T02`, `T03` | Yes | Pending |
| 5 | `T05` | Portfolio organization | Folders/groups/tags for many projects | `T04` | Yes | Pending |
| 6 | `T06` | Milestones and progress | Per-project progress and milestone linking | `T04` | Yes | Pending |
| 7 | `T07` | Advanced task engine | Subtasks + dependencies + blocking rules | `T04` | Yes | Pending |
| 8 | `T08` | Project + monthly Kanban board | Board scopes, drag/drop, and status updates | `T04`, `T06`, `T07` | Yes | Pending |
| 9 | `T09` | Collaboration layer | Task comments, invites, markdown comments | `T03`, `T04` | Yes | Pending |
| 10 | `T10` | Global dashboard and weekly rollup | Portfolio views + weekly reporting | `T04`, `T05`, `T06` | Yes | Pending |
| 11 | `T11` | Cross-project search and view switching | Fast lookup/navigation for large datasets | `T04`, `T05`, `T10` | Yes | Pending |
| 12 | `T12` | Desktop-native utilities | Native notifications, dock badge, updater path | `T03`, `T04`, `T10` | Yes | Pending |
| 13 | `T13` | Attachments and data portability | File attachments + CSV/JSON import/export | `T03`, `T04` | Yes | Pending |
| 14 | `T14` | Productivity UX baseline | Markdown descriptions + multi-window behavior | `T04`, `T08`, `T11` | Yes | Pending |
| 15 | `T17` | Global task calendar | Cross-project calendar with filters and task drill-down | `T04`, `T10`, `T11` | Yes | Pending |
| 16 | `T18` | Project bug tracking | Bug CRUD, triage lifecycle, severity/priority, project filters | `T03`, `T04` | Yes | Pending |
| 17 | `T19` | Identity UX + workspace lifecycle + invite model | Profile management, account deletion, invite entity (addendum 2.13) with token lifecycle | `T03`, `T09` | Yes | Pending |
| 18 | `T20` | Extended data + validation + entity links | Cross-entity comments, Entity Link model (addendum 2.12), centralized validation contracts including rules 9-12 | `T04`, `T05`, `T06`, `T07`, `T09`, `T13`, `T18` | Yes | Pending |
| 19 | `T23` | Activity trail and notification implementation | Activity stream, change-driven alerts, and notification inbox | `T09`, `T10`, `T12`, `T18`, `T20` | Yes | Pending |
| 20 | `T21` | Desktop UX completeness + user preferences | Settings with User Preferences model (addendum 2.14), sync status, conflict/error/loading/empty/onboarding/menu UX | `T03`, `T10`, `T11`, `T12`, `T14`, `T19`, `T23` | Yes | Pending |
| 21 | `T22` | Scale + high-volume workflows + recurring task model | Bulk actions, quick add, Recurring Task Definition (addendum 2.11), Kanban ordering, trash with 30-day purge, virtualization, quota indicators | `T07`, `T08`, `T10`, `T11`, `T13`, `T18`, `T20` | Yes | Pending |
| 22 | `T15` | NFR hardening | Performance, offline reliability, accessibility, monitoring | `T04` to `T14`, `T17` to `T23` | Partial | Pending |
| 23 | `T16` | Ship readiness | Packaging, code signing, UAT, release checklist | `T15` | No | Pending |

## 4. Parallel Workstreams

## Stream A: Platform/Data

1. `T02`, `T03` platform and security foundation.
2. `T04`, `T06`, `T07`, `T18` domain feature modules.
3. `T20` shared schema and validation contract layer.
4. `T13`, `T22` storage, scale constraints, and operational guardrails.
5. `T15` reliability hardening and instrumentation.

## Stream B: Desktop UX

1. `T04`, `T05` core workspace and organization UI.
2. `T08` Kanban UI and interactions.
3. `T09`, `T10`, `T11`, `T17` collaboration/portfolio/search/calendar UX.
4. `T12`, `T14`, `T19`, `T21` native desktop and account/settings UX.

## Stream C: Quality/Release

1. Test matrix starts after `T01`.
2. Module-level integration coverage runs in parallel for `T04` to `T14` and `T17` to `T23`.
3. Full regression/perf/offline/release validation in `T15` and `T16`.

## 5. Dependency Callouts for Parallel Teams

1. Team work can start in parallel only after `T02` publishes baseline architecture and API/schema contracts.
2. `T03` must complete before any team finalizes invitations, profile/account flows, or role-sensitive UI actions.
3. `T20` must publish final validation/data contracts before `T23`, `T21`, and `T22` are closed.
4. `T10` must complete before `T12` (desktop-native overdue/badge counts require portfolio aggregation) and before finalizing notification routing, dashboard drill-down, and calendar/search integration behavior with `T11`.
5. `T23` and `T22` should run in parallel with `T21`, but all three must finish before `T15` NFR hardening sign-off.
6. `T16` starts only after `T15` evidence is complete for all FR/NFR acceptance checks.

## 6. Requirement Mapping (Aligned with 01)

| Requirement Group | Task IDs |
| --- | --- |
| `FR-001` to `FR-009` | `T04` |
| `FR-010` to `FR-012` | `T06` |
| `FR-013` to `FR-015` | `T09` |
| `FR-016` to `FR-018` | `T12` |
| `FR-019` to `FR-020` | `T11` |
| `FR-021` to `FR-024` | `T08` |
| `FR-025` to `FR-027` | `T03` |
| `FR-028`, `FR-030` to `FR-033` | `T10` |
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

## 7. Sprint Batching

1. Sprint 1: `T01`, `T02`, `T03`
2. Sprint 2: `T04`, `T05`, `T06`
3. Sprint 3: `T07`, `T09`, `T13`, `T18`
4. Sprint 4: `T08`, `T10`, `T19`
5. Sprint 5: `T11`, `T12`, `T14`, `T17`, `T20`
6. Sprint 6: `T23`, `T21`, `T22`
7. Sprint 7: `T15`, `T16`

> **Note**: `T13` and `T18` are moved to Sprint 3 (earliest possible given dependencies on `T03` + `T04`). `T19` is moved to Sprint 4 (earliest possible given dependencies on `T03` + `T09`). This reduces the overall schedule from 8 sprints to 7.

## 8. Exit Criteria

1. All `T01` to `T23` tasks close with acceptance evidence.
2. Requirement traceability has no uncovered FR/NFR items.
3. Signed installers are tested on target desktop platforms.
4. Parallel stream handoff artifacts (contracts, events, validation rules) are versioned and approved.

## 9. Progress Log

| Date | Milestone | Notes |
| --- | --- | --- |
| 2026-02-19 | `T01` skipped | Pragmatic defaults adopted; open questions resolved incrementally during implementation. |
| 2026-02-19 | `T02` complete | Foundation Gate (G1) passed. Electron shell, 17 Zod schemas, app shell with routing, build pipeline, and 31 passing tests. |
| | `T03` next | Requires Firebase project setup in Firebase Console before implementation. |
