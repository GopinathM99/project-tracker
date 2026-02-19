# Project Tracker Requirements Pack

This folder contains requirements and planning documents only.
No implementation details or code decisions are finalized here.

## Document Map

1. `product/01-product-brief.md` - Product vision, problem, users, and goals.
2. `scope/02-mvp-scope.md` - MVP boundaries, out-of-scope items, and milestones.
3. `requirements/03-functional-requirements.md` - Functional requirements with IDs.
4. `requirements/04-non-functional-requirements.md` - Quality, reliability, security, and compliance expectations.
5. `ux/05-user-flows.md` - Core user journeys and acceptance criteria.
6. `ux/07-kanban-dashboard.md` - Kanban dashboard behavior and acceptance criteria.
7. `planning/06-open-questions.md` - Open product decisions and unresolved assumptions.
8. `planning/07-project-task-calendar-requirements.md` - Planning addendum for explicit project/task fields and global calendar requirements.
9. `planning/08-project-bug-requirements.md` - Planning addendum for project-level bug tracking and required bug fields.
10. `planning/09-kanban-modes-requirements.md` - Planning addendum for dual Kanban modes (project and monthly due-date scope).
11. `planning/10-extended-data-models-and-ux-addendum.md` - Extended entity schemas, validation limits, desktop UX contracts, and explicit Post-MVP defer decisions.
12. `implementation/01-implementation-plan.md` - Ordered implementation plan with dependencies and parallel tracks.
13. `implementation/02-desktop-implementation-plan.md` - Desktop-aligned implementation sequence mapped to requirements.
14. `implementation/03-parallel-execution-dependency-map.md` - Dependency gates, DAG edges, and parallel team execution model.

## How To Use This Pack

1. Review `product/01-product-brief.md` and confirm business goals.
2. Confirm `scope/02-mvp-scope.md` to avoid scope creep.
3. Validate requirement IDs in `requirements/03-functional-requirements.md` and `requirements/04-non-functional-requirements.md`.
4. Review `planning/07-project-task-calendar-requirements.md` to confirm project/task field completeness and calendar coverage.
5. Review `planning/08-project-bug-requirements.md` to confirm bug field completeness and bug lifecycle scope.
6. Review `planning/09-kanban-modes-requirements.md` to confirm project vs monthly Kanban behavior.
7. Review `planning/10-extended-data-models-and-ux-addendum.md` for workspace/auth/data-model and UX completeness.
8. Walk through `ux/05-user-flows.md` and `ux/07-kanban-dashboard.md` with stakeholders.
9. Resolve `planning/06-open-questions.md` before implementation starts.
10. Use `implementation/01-implementation-plan.md` to execute work in dependency order.
11. Use `implementation/03-parallel-execution-dependency-map.md` to coordinate multi-team parallel execution.

## Status

- Draft version: `v0.1`
- Last updated: `2026-02-19`
- Implementation status: `In progress — T02 (Foundation) complete, T03 (Auth) next`
- Foundation Gate (G1): **PASSED**
- Next milestone: Security Gate (G2) — requires Firebase project setup
