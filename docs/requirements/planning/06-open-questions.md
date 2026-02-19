# 06. Open Questions and Decisions

## 0. Recently Resolved Decisions (2026-02-17)

1. Global dashboard includes bug metrics (`FR-103`).
2. Calendar includes eligible bug items via `target_fix_date` (`FR-102`).
3. Cross-project dependency links are deferred to Post-MVP (MVP supports same-project dependencies only).
4. Bug-specific Kanban board mode is deferred to Post-MVP.
5. Visual print/PDF export is deferred to Post-MVP (CSV/JSON export remains in MVP).
6. Task/project templates are deferred to Post-MVP.

## 1. Product Decisions Pending

1. Should MVP support single-user only, or team collaboration from day one?
2. What authentication methods are required (email/password, SSO, OAuth)?
3. Beyond Native OS notifications, do we also need optional email digests in MVP?
4. What dependency rules are required in MVP (hard-block only vs warning mode)?
5. What import/export formats are required for MVP (`CSV`, `JSON`, both)?
6. What is the exact definition of project completion?
7. Should Kanban support custom columns in MVP or fixed status columns only?
8. Should the global calendar allow drag-and-drop rescheduling in MVP or read-only timeline tracking first?
9. Should bug tracking be visible only inside projects, or also as a global cross-project bug dashboard in MVP?
10. Should monthly Kanban be read-only for scope (current month only), or allow month navigation in MVP?

## 2. Data and Permissions

1. Can one task have multiple owners?
2. Should viewers be allowed to comment?
3. Are archived projects searchable?
4. Should task delete be soft-delete only?
5. Should task cards in Kanban show assignee avatars, due date, and priority by default?
6. What file types and size limits should be allowed for task/project attachments?
7. Is `due_date` optional when `expected_completion_date` is already provided?
8. What timezone policy should calendar views use for distributed teams?
9. Is bug `assignee` required at creation or only after triage?
10. Should closed bugs be editable or reopen-only?
11. What timezone should define "current month" inclusion for monthly Kanban due dates?

## 3. Operational and Compliance

1. Which regions will the MVP serve first?
2. Any customer-specific data retention requirements?
3. Backup/restore objectives required for launch?
4. Which platforms are in scope for first release (`macOS`, `Windows`, both)?

## 4. Decision Log Template

| Date | Decision | Owner | Impacted Docs | Notes |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | TBD | TBD | TBD | TBD |

## 5. Sign-Off Checklist Before Implementation

1. Product goals confirmed.
2. MVP scope approved.
3. Functional and non-functional requirements validated.
4. Open questions resolved or explicitly deferred.
5. Stakeholder sign-off recorded.
