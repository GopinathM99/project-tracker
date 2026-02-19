# 02. MVP Scope

## 1. In Scope (MVP)

1. Create, edit, archive projects.
2. Define project timeline (start date, target end date).
3. Create, edit, delete tasks under projects.
4. Assign task owner, due date, priority, and status.
5. Track milestone checkpoints.
6. View project progress dashboard (basic metrics).
7. Use Kanban boards in two modes: per-project and monthly (tasks with current-month due dates) with columns by task status.
8. Add comments/notes to tasks.
9. Filter tasks by status, owner, and due date.
10. Basic notifications for upcoming and overdue tasks (Native OS).
11. **Global Dashboard**: Unified view of all tasks across all projects.
12. **Project Organization**: Group projects into Folders/Groups.
13. **Advanced Task Features**: Subtasks and Task Dependencies.
14. **Data Sync**: Cloud Sync via Firebase (Auth + Firestore).
15. **File Attachments**: Attach local files to tasks/projects.
16. **Rich Content**: Markdown support for task/project descriptions and comments.
17. **Data Portability**: Import and Export project/task data (`CSV`/`JSON`).
18. **Desktop UX**: Multi-window support for working across projects.
19. **Task Planning Dates**: Capture task `start date` and `expected completion date` (in addition to optional `due date`).
20. **Global Task Calendar**: View all active-project tasks in `Month`, `Week`, and `Day` calendar views.
21. **Project Bug Tracking**: Create and manage bugs under projects with required bug fields, triage status, severity, and priority.

## 2. Out of Scope (MVP)

1. Time tracking and billable hours.
2. Advanced resource leveling and capacity planning.
3. Native mobile applications (iOS/Android) - Mobile web optional.
4. Third-party integrations (Slack, Jira, GitHub, etc.).
5. AI-based auto planning/recommendations.
6. Visual print/PDF report export (data export via `CSV`/`JSON` remains in scope).
7. Bug-specific Kanban board mode (bug lists and triage remain in scope).
8. Cross-project task dependency links (MVP supports same-project dependencies only).
9. Task and project templates.
10. Gantt/timeline visualization.
11. Dashboard layout customization and saved filter presets.
12. Duplicate detection for tasks/bugs.
13. Localization/i18n beyond baseline timezone correctness.
14. Task effort/size estimation fields.
15. `@mentions` in comments.

## 3. MVP Milestones (Planning)

1. Requirements sign-off.
2. UX wireframes and flow validation.
3. Data model and API contract drafting (Firestore schema).
4. Implementation phase (Electron + React).
5. QA and user acceptance test.
6. MVP release.

## 4. Scope Guardrails

1. Any new feature request must map to a primary goal in `product/01-product-brief.md`.
2. Additions that increase delivery risk should be deferred to post-MVP backlog.
3. If a feature does not improve planning visibility or accountability, default to out-of-scope.
