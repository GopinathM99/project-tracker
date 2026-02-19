# 03. Parallel Execution Dependency Map

## 1. Purpose

Provide an execution-ready dependency view so multiple teams can implement in parallel without blocking each other.

## 2. Contract Gates

1. `G1 - Foundation Gate`: **PASSED** (2026-02-19)
   - Complete: `T01` (skipped), `T02` (done)
   - Output: Electron + React app shell, 17 Zod schemas, Tailwind theme, build pipeline, test infrastructure.
2. `G2 - Security Gate`: **OPEN** — next up
   - Complete: `T03`
   - Output: auth lifecycle, workspace scoping, RBAC and security rules.
3. `G3 - Core Domain Gate`: OPEN
   - Complete: `T04`
   - Output: project/task base model and CRUD contracts.
4. `G4 - Extended Data Gate`: OPEN
   - Complete: `T20`
   - Output: cross-entity schemas, validation limits, linking semantics.
5. `G4b - Activity and Notification Gate`: OPEN
   - Complete: `T23`
   - Output: event-driven activity/notification pipeline and inbox delivery contracts.
6. `G5 - Desktop UX Consistency Gate`: OPEN
   - Complete: `T21`
   - Output: settings/sync/error/loading/onboarding/menu standards.
7. `G6 - Scale Gate`: OPEN
   - Complete: `T22`
   - Output: bulk workflows, recurring tasks, virtualization, quota behavior.

## 3. Dependency Edges (DAG)

1. `T01 -> T02`
2. `T02 -> T03`
3. `T03 -> T04`, `T09`, `T12`, `T18`, `T19`
4. `T04 -> T05`, `T06`, `T07`, `T09`, `T10`, `T12`, `T13`, `T17`, `T18`, `T20`
5. `T06`, `T07`, `T04 -> T08`
6. `T05`, `T06`, `T04 -> T10`
7. `T10`, `T04`, `T05 -> T11`
8. `T08`, `T11`, `T04 -> T14`
9. `T10`, `T11`, `T04 -> T17`
10. `T03`, `T09 -> T19`
11. `T04`, `T05`, `T06`, `T07`, `T09`, `T13`, `T18 -> T20`
12. `T10 -> T12`
13. `T09`, `T10`, `T12`, `T18`, `T20 -> T23`
14. `T03`, `T10`, `T11`, `T12`, `T14`, `T19`, `T23 -> T21`
15. `T07`, `T08`, `T10`, `T11`, `T13`, `T18`, `T20 -> T22`
16. `T04` to `T14`, `T17` to `T23 -> T15`
17. `T15 -> T16`

## 4. Parallel Team Plan

1. Team A (Core Domain):
   - Primary: `T04`, `T06`, `T07`, `T20`
   - Starts after: `G2`
2. Team B (Portfolio + Search + Calendar):
   - Primary: `T10`, `T11`, `T17`
   - Starts after: `T04`
3. Team C (Collaboration + Identity UX):
   - Primary: `T09`, `T19`, `T23`
   - Starts after: `G2`
4. Team D (Desktop Experience):
   - Primary: `T08`, `T12`, `T14`, `T21`
   - Starts after: `T04` (for domain contracts), with `T21` closing after `G4` and `G4b`
5. Team E (Scale + Data Operations):
   - Primary: `T13`, `T18`, `T22`
   - Starts after: `T04`, with `T22` closing after `G4`
6. Team F (Quality/Release):
   - Primary: `T15`, `T16`
   - Starts test scaffolding after `T01`; hardening closes after `G5` and `G6`.

## 5. Handoff Artifacts Required

1. `T03` publishes auth/workspace contract and access matrix.
2. `T04` publishes core entity API and event naming conventions.
3. `T19` publishes Invite entity schema, token lifecycle contract, and invite-to-member transition rules.
4. `T20` publishes schema catalog (including Entity Link model for bug-task traceability), validation constants, and validation rules 9–12 (folder depth, trash purge, link limits, Kanban sort order).
5. `T21` publishes UX state spec for sync/error/loading/onboarding/menu behavior and User Preferences entity schema.
6. `T22` publishes Recurring Task Definition schema, instance generation contract, performance baselines for bulk actions, and high-volume list views.
7. `T23` publishes event routing contracts and notification payload schema.

## 6. Parallel Execution Rules

1. No team should hardcode validation/limits before `T20` artifacts are published (including rules 9–12 for folder depth, trash purge, link limits, and Kanban sort order).
2. Desktop shortcut/menu implementations must follow `T21` standards for all modules.
3. Settings/preferences screens must read/write the User Preferences entity published by `T21`.
4. New cross-entity metrics/events must reuse shared event taxonomy from `T20`.
5. Bug-task links must use the Entity Link model from `T20`, not the Dependency Link model (which is for task-to-task scheduling).
6. Recurring task instance generation must follow the Recurring Task Definition contract from `T22`.
7. Activity and notification producers/consumers must validate against `T23` payload contracts.
8. `T15` hardening sign-off requires evidence from every team for mapped FR/NFR coverage.
