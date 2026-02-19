# 03. Functional Requirements

> Note: FR IDs are intentionally non-contiguous in some ranges to preserve historical traceability from earlier requirement drafts.

## 1. Project Management

- `FR-001`: User can create a project with name, description, status, owner, start date, and target end date.
- `FR-002`: User can edit project metadata.
- `FR-003`: User can archive and unarchive a project.
- `FR-004`: User can view all projects they have access to.

## 2. Task Management

- `FR-005`: User can create tasks within a project.
- `FR-006`: Each task supports title, description, owner, start date, expected completion date, due date, priority, status, and project linkage.
- `FR-007`: User can update task status (`Not Started`, `In Progress`, `Blocked`, `Done`).
- `FR-008`: User can delete tasks (soft delete preferred for auditability).
- `FR-009`: User can filter/sort tasks by owner, due date, priority, and status.

## 3. Milestones and Progress

- `FR-010`: User can create milestones within a project.
- `FR-011`: Milestones can be linked to one or more tasks.
- `FR-012`: System shows progress summary for each project (tasks done vs total, overdue count).

## 4. Collaboration

- `FR-013`: User can add comments on a task.
- `FR-014`: System stores comment author and timestamp.
- `FR-015`: Project owner can invite members to the project workspace.

## 5. Notifications

- `FR-016`: System sends reminder for tasks due within configurable window (default 24 hours).
- `FR-017`: System sends overdue notification when due date passes and task is not `Done`.
- `FR-018`: User can opt in or out of reminder notifications.

## 6. Search and Views

- `FR-019`: User can search projects and tasks by keyword.
- `FR-020`: User can switch between project overview and task list views.

## 7. Kanban Dashboard

- `FR-021`: User can open a Kanban board view for each project.
- `FR-022`: Board columns are grouped by task status (`Not Started`, `In Progress`, `Blocked`, `Done`).
- `FR-023`: User can move tasks between columns to update status.
- `FR-024`: Each project board shows progress summary (total tasks, done percentage, blocked count, overdue count).

## 8. Access Control (Draft)

- `FR-025`: Role `Owner` can manage project settings and members.
- `FR-026`: Role `Member` can create/update tasks and comments.
- `FR-027`: Role `Viewer` can read project/task data without edits.

## 9. Reporting (MVP-light)

- `FR-028`: User can view weekly summary of completed, in-progress, blocked, and overdue tasks.

## 10. Global Dashboard

- `FR-030`: User can view a "Global Dashboard" aggregating tasks from all active projects.
- `FR-031`: Dashboard shows "My Tasks" (assigned to current user) across all projects.
- `FR-032`: Dashboard shows "Overdue" and "Upcoming" tasks across the entire portfolio.
- `FR-033`: User can click a task in the Global Dashboard to navigate to its project context.

## 11. Project Organization

- `FR-040`: User can create Folders/Groups to organize multiple projects (e.g., "Client A", "Internal").
- `FR-041`: User can move existing projects into and out of Folders.
- `FR-042`: User can collapse/expand Folders in the project navigation sidebar.
- `FR-043`: User can assign Tags to projects for cross-cutting categorization.

## 12. Advanced Task Features

- `FR-050`: User can create Subtasks within a parent task.
- `FR-051`: Subtasks have their own status (`Done`/`Not Done`) but inherit project context.
- `FR-052`: User can define Dependencies: Task B cannot start until Task A is done.
- `FR-053`: System visually indicates blocked status if a dependency is not met.

## 13. Desktop Integration

- `FR-060`: Application runs as a native Desktop app (Electron).
- `FR-061`: App supports offline read/write with auto-sync when online (Firebase).
- `FR-062`: System uses Native OS Notifications for alerts.
- `FR-063`: App shows unread/overdue count badge on the dock/taskbar icon.

## 14. File Attachments and Data Portability

- `FR-064`: User can attach local files to tasks and projects.
- `FR-065`: User can open, download, and remove attachments based on permissions.
- `FR-066`: User can export selected project/workspace data to local `CSV` and `JSON` files.
- `FR-067`: User can import project/task data from supported `CSV`/`JSON` templates.

## 15. Rich Content and Desktop Workflow

- `FR-068`: Task and project descriptions support Markdown formatting.
- `FR-069`: Task comments support Markdown formatting.
- `FR-070`: User can open multiple project windows simultaneously.

## 16. Project/Task Field Completeness and Calendar View

- `FR-071`: System stores required project fields: `project_id`, `name`, `description`, `status`, `owner`, `start_date`, `target_end_date`, `created_at`, and `updated_at`.
- `FR-072`: System stores required task fields: `task_id`, `project_id`, `parent_task_id` (nullable), `title`, `description`, `status`, `start_date`, `expected_completion_date`, `due_date` (nullable), `priority`, `owner`, `recurrence_id` (nullable), `kanban_sort_order` (nullable), `created_at`, and `updated_at`.
- `FR-073`: Every top-level task must belong to exactly one project (`project_id` is required).
- `FR-074`: System validates task dates so `expected_completion_date` and `due_date` (if present) are not earlier than `start_date`.
- `FR-075`: User can open a global calendar that shows tasks from all active projects.
- `FR-076`: Calendar supports `Month`, `Week`, and `Day` views.
- `FR-077`: User can filter calendar tasks by project, task status, and owner.
- `FR-078`: Selecting a calendar task opens task detail in its project context.
- `FR-079`: Calendar visually differentiates task state (`Not Started`, `In Progress`, `Blocked`, `Done`, overdue).

## 17. Bug Tracking

- `FR-080`: User can create bugs within a project.
- `FR-081`: System stores required bug fields: `bug_id`, `project_id`, `title`, `description`, `status`, `severity`, `priority`, `reporter`, `assignee` (nullable), `environment`, `steps_to_reproduce`, `expected_result`, `actual_result`, `reported_at`, `target_fix_date` (nullable), `resolved_at` (nullable), `created_at`, and `updated_at`.
- `FR-082`: Every bug must belong to exactly one project (`project_id` is required).
- `FR-083`: User can update bug status (`New`, `Triaged`, `In Progress`, `Fixed`, `Verified`, `Closed`, `Reopened`).
- `FR-084`: User can set and update bug `severity` and `priority`.
- `FR-085`: User can assign and reassign bug ownership.
- `FR-086`: User can filter/sort bugs by status, severity, priority, assignee, and project.
- `FR-087`: System validates bug dates so `target_fix_date` (if present) is not earlier than `reported_at`.

## 18. Kanban Modes

- `FR-088`: System supports two Kanban scopes: `Project Kanban` and `Monthly Kanban`.
- `FR-089`: `Monthly Kanban` includes tasks whose `due_date` falls within the current calendar month.
- `FR-090`: Tasks without `due_date` are excluded from `Monthly Kanban`.
- `FR-091`: Selecting a task card in `Monthly Kanban` opens task detail in its project context.

## 19. Identity, Workspace, and Access Flows

- `FR-092`: System provides authentication flows for `Sign Up`, `Sign In`, `Sign Out`, `Password Reset`, and session expiration recovery.
- `FR-093`: User can manage profile details (`display_name`, `avatar`, `email`) and update account credentials.
- `FR-094`: Workspace/project owners can invite members by email with role assignment; invite lifecycle includes `Pending`, `Accepted`, `Expired`, and `Revoked`.
- `FR-095`: User can request account deletion; system enforces ownership transfer or explicit archive handling for shared workspace assets before deletion completes.
- `FR-096`: All projects, tasks, bugs, milestones, and comments must be scoped to exactly one workspace.

## 20. Activity Trail and Notification Expansion

- `FR-097`: System records entity-level activity events (actor, action, entity type/id, timestamp, and change summary) for project/task/bug/milestone/comment mutations.
- `FR-098`: User can view activity history at workspace, project, and item levels with filters by actor, entity type, and date range.
- `FR-099`: System triggers change-driven notifications for assignment changes, status/priority transitions, due-date changes, new comments, and invite events.
- `FR-100`: Application provides an in-app notification inbox/history with read/unread state and deep links to related entities.

## 21. Data Model Completeness and Cross-Entity Coverage

- `FR-101`: Comments are supported on tasks, bugs, and projects with consistent create/edit/delete behavior and audit metadata.
- `FR-102`: Global calendar includes eligible bugs using `target_fix_date` with visual distinction from tasks.
- `FR-103`: Global dashboard includes bug portfolio metrics (overdue, unassigned, and severity/status breakdown).
- `FR-104`: Tasks and bugs support explicit bidirectional links for traceability (`related bug`, `fix task`, or equivalent relation label).
- `FR-105`: Milestone, workspace, comment, folder/tag, attachment, dependency, recurring task definition, entity link, invite, and user preferences entities must follow the planning field definitions in `docs/requirements/planning/10-extended-data-models-and-ux-addendum.md`.

## 22. Data Validation and Guardrails

- `FR-106`: System validates project dates so `target_end_date` cannot be earlier than `start_date`.
- `FR-107`: System enforces cross-entity date constraints so task/bug planned dates remain within parent project active range.
- `FR-108`: System enforces centralized field length and count limits for core entities (projects, tasks, bugs, comments, tags, attachments).
- `FR-109`: System enforces maximum subtask nesting depth and prevents dependency cycles before save.

## 23. Desktop UX Completeness

- `FR-110`: System provides undo/redo for supported task/project/bug edits, delete/restore actions, and Kanban card movements.
- `FR-111`: Application includes a unified `Settings` screen covering notifications, view defaults, theme, shortcuts, account, and data preferences.
- `FR-112`: Application shows sync status (`Offline`, `Syncing`, `In Sync`, `Sync Error`) with last synced timestamp and conflict indicators.
- `FR-113`: Application surfaces conflict resolution outcomes to users, including when local changes are overwritten by server resolution policy.
- `FR-114`: Application provides defined loading states, empty states, error states, and retry paths for all primary views.
- `FR-115`: Application includes first-run onboarding that guides users through workspace/project/task setup.
- `FR-116`: Desktop menu bar must expose standard app menus (`File`, `Edit`, `View`, `Window`, `Help`) and discoverable shortcuts.
- `FR-117`: Shortcut and interaction behavior adapts to OS conventions (`Cmd` on macOS, `Ctrl` on Windows/Linux).

## 24. Scalability and High-Volume Workflows

- `FR-118`: User can perform bulk selection and bulk actions (status, owner, priority, archive/delete) across task and bug lists.
- `FR-119`: Application supports quick-add entry for tasks from global context with required defaults and keyboard-first flow.
- `FR-120`: System supports recurring task definitions (daily/weekly/monthly/custom interval) and auto-generates future task instances.
- `FR-121`: Kanban supports manual within-column ordering and persists order across refresh and sync.
- `FR-122`: Application provides trash/recycle-bin workflows for soft-deleted tasks, bugs, and projects, including restore and permanent purge actions.
- `FR-123`: High-volume list views support pagination and/or virtualization strategies without breaking filtering and sorting behavior.
- `FR-124`: Application tracks local/cloud storage usage and warns users when configured quota thresholds are reached.
