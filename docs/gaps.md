# Identified Gaps

Based on the requirement for a **thorough desktop application** to **track a lot of projects**, the following gaps were identified in the current documentation (which currently describes a web-first MVP).

> **Status Update**: All identified gaps now have explicit status (`COMPLETED` or `DEFERRED_POST_MVP`) with references to updated Requirements (`docs/requirements/`) and Scope (`docs/scope/`).

## 1. Platform & Architecture (Desktop vs. Web)
- **Desktop Framework Specification**: The docs currently assume a web-based architecture (referencing "monthly uptime", "TLS", "browser support"). There is no specification for the desktop technology (e.g., Electron, Tauri, Flutter).
    - **[COMPLETED]** Addressed in `NFR-000` (Electron + React) and `02-desktop-implementation-plan.md`.
- **Offline Capabilities**: Desktop apps are expected to work offline. The current requirements (`NFR-006`) mention "service availability" but do not address local-first data persistence or offline-mode syncing.
    - **[COMPLETED]** Addressed in `NFR-005` (Offline functionality) and `FR-061` (Offline read/write with sync).
- **Native Integration**:
    - **Notifications**: `FR-016` mentions system reminders, but desktop apps should use native OS notifications, not just email or in-app toasts.
        - **[COMPLETED]** Addressed in `FR-062` (Native OS Notifications).
    - **File System Access**: No requirements for saving/exporting data locally or attaching local files to tasks.
        - **[COMPLETED]** Addressed in `FR-064` (Attachments), `FR-066` (Local Export), and `NFR-023` (File handling).
- **Updates/Distribution**: No requirements for how the desktop app will be distributed or updated (e.g., auto-updater).
    - **[COMPLETED]** Addressed in `NFR-019` (Auto-updater), `NFR-020` (Code signing), and `02-desktop-implementation-plan.md`.

## 2. Portfolio Management (Tracking "Everything")
- **Global Dashboard**: `FR-012` and `FR-024` describe per-project dashboards. `Scope/02-mvp-scope.md` explicitly excludes "Advanced portfolio reporting" and "Cross-project portfolio Kanban board".
    - *Gap*: To "track everything" across many projects, a unified "All Tasks" view or "Portfolio Dashboard" is essential.
    - **[COMPLETED]** Addressed in `FR-030` (Global Dashboard), `FR-031` (My Tasks), `FR-032` (Overdue/Upcoming), and `T10` (Portfolio views).
- **Project Organization**:
    - No ability to group projects (e.g., Folders, Categories, Tags, or Areas).
    - With "a lot of projects," a flat list (`FR-004`) will become unmanageable.
    - **[COMPLETED]** Addressed in `FR-040` (Folders/Groups), `FR-041` (Move projects), `FR-043` (Tags), and `T05` (Portfolio organization).
- **Cross-Project Search**: `FR-019` mentions search, but it needs to be robust enough to handle a large volume of projects/tasks instantly (desktop standard).
    - **[COMPLETED]** Addressed in `FR-019` (Search), `NFR-003` (Search performance), and `T11` (Cross-project search).

## 3. Data Depth & Thoroughness
- **Task Complexity**:
    - **Subtasks**: Not mentioned. "Thorough" tracking usually requires breaking tasks down.
        - **[COMPLETED]** Addressed in `FR-050` (Subtasks), `FR-051` (Subtask status).
    - **Dependencies**: Explicitly marked "Out of Scope" (`Scope/02-mvp-scope.md`).
        - **[COMPLETED]** Addressed in `FR-052` (Dependencies), `FR-053` (Blocked status).
    - **Attachments**: No requirement for attaching files (images, docs) to tasks or projects.
        - **[COMPLETED]** Addressed in `FR-064` (Attach files), `FR-065` (Manage attachments).
- **Rich Text/Content**: `FR-006` mentions "description", but doesn't specify Markdown or rich text support, which is standard for desktop productivity tools.
    - **[COMPLETED]** Addressed in `FR-068` (Markdown descriptions), `FR-069` (Markdown comments), and `T14` (Productivity UX).
- **Import/Export**: "Open Questions" mentions export is TBD. For a desktop app, users expect to own their data (JSON/CSV export/import).
    - **[COMPLETED]** Addressed in `FR-066` (Export), `FR-067` (Import), `NFR-013`, and `NFR-021`.

## 4. User Experience (Desktop Expectations)
- **Keyboard Shortcuts**: `NFR-015` mentions keyboard navigation, but desktop power users expect global hotkeys (e.g., "Quick Add Task" from anywhere) and specific shortcuts for common actions (Cmd+N, Cmd+S).
    - **[COMPLETED]** Addressed in `NFR-015` (Global Hotkeys, Quick Add).
- **Multi-Window Support**: Desktop apps often allow opening multiple projects in separate windows. The current flow assumes a single-window web navigation structure.
    - **[COMPLETED]** Addressed in `FR-070` (Multi-window support), `NFR-022` (Multi-window performance), and `T14`.

## 5. Implementation Details
- **Tech Stack**: The `Implementation Plan` does not define the desktop stack (e.g., React + Electron vs. Rust + Tauri).
    - **[COMPLETED]** Addressed in `NFR-000` (Electron + React) and `02-desktop-implementation-plan.md`.
- **Data Storage**: The docs imply a backend database. For a desktop app, we need to decide between:
    - **Local-only** (SQLite/JSON file)
    - **Cloud-only** (API based)
    - **Hybrid** (Local-first with Sync)
    - **[COMPLETED]** Addressed in `NFR-000b` (Firebase), `NFR-005` (Offline-First), `NFR-006` (Sync), and `02-desktop-implementation-plan.md` (Hybrid approach).

---

> **Note**: Sections 6-13 have now been reviewed and resolved with explicit requirement updates or explicit Post-MVP deferrals.

## 6-13 Gap Status Matrix

| Gap ID | Priority | Status | Resolution |
| --- | --- | --- | --- |
| 6.1 Authentication flow specification | Critical | `COMPLETED` | `FR-092`, `NFR-025` |
| 6.2 User profile management | Critical | `COMPLETED` | `FR-093` |
| 6.3 User invitation workflow | Critical | `COMPLETED` | `FR-094`, addendum Invite model (2.13) and Workspace Member model (2.2), `NFR-025` |
| 6.4 Account deletion and data ownership | Important | `COMPLETED` | `FR-095` |
| 7.1 Activity/audit log | Important | `COMPLETED` | `FR-097`, `FR-098`, `NFR-026` |
| 7.2 Change-driven notifications | Important | `COMPLETED` | `FR-099`, `FR-100` |
| 8.1 Milestone data model | Critical | `COMPLETED` | `FR-105`, `docs/requirements/planning/10-extended-data-models-and-ux-addendum.md` (Milestone model) |
| 8.2 Workspace/team/organization entity | Critical | `COMPLETED` | `FR-096`, `FR-105`, addendum Workspace and Workspace Member models |
| 8.3 Comment data model | Important | `COMPLETED` | `FR-101`, `FR-105`, addendum Comment model |
| 8.4 Folder/group/tag data models | Important | `COMPLETED` | `FR-105`, addendum Folder and Tag models |
| 8.5 Attachment data model | Important | `COMPLETED` | `FR-105`, addendum Attachment model, `NFR-032` |
| 8.6 Dependency/link data model | Important | `COMPLETED` | `FR-104`, `FR-105`, addendum Dependency Link model (2.8) and Entity Link model (2.12) |
| 9.1 Project date validation | Critical | `COMPLETED` | `FR-106` |
| 9.2 Cross-entity date constraints | Important | `COMPLETED` | `FR-107`, addendum validation rules |
| 9.3 Field length/content limits | Important | `COMPLETED` | `FR-108`, `NFR-027`, addendum limit baseline |
| 9.4 Subtask depth and circular dependency prevention | Critical | `COMPLETED` | `FR-109`, addendum validation rules |
| 10.1 Undo/redo support | Important | `COMPLETED` | `FR-110`, `NFR-031` |
| 10.2 Printing and PDF export | Nice-to-Have | `DEFERRED_POST_MVP` | Added to out-of-scope in `docs/scope/02-mvp-scope.md` |
| 10.3 Platform-specific behaviors | Important | `COMPLETED` | `FR-117`, `NFR-024` |
| 10.4 Application menu bar structure | Important | `COMPLETED` | `FR-116`, addendum menu bar contract |
| 11.1 Comments on bugs and projects | Important | `COMPLETED` | `FR-101` |
| 11.2 Bugs on calendar | Important | `COMPLETED` | `FR-102` |
| 11.3 Bugs on global dashboard | Important | `COMPLETED` | `FR-103` |
| 11.4 Bugs on Kanban board | Nice-to-Have | `DEFERRED_POST_MVP` | Added to out-of-scope in `docs/scope/02-mvp-scope.md` |
| 11.5 Bug-to-task linking | Important | `COMPLETED` | `FR-104`, addendum Entity Link model (2.12) |
| 11.6 Cross-project task linking | Nice-to-Have | `DEFERRED_POST_MVP` | Explicit MVP limitation in addendum (`is_cross_project=false`) and out-of-scope in `docs/scope/02-mvp-scope.md` |
| 12.1 Settings/preferences screen | Critical | `COMPLETED` | `FR-111`, addendum User Preferences model (2.14) |
| 12.2 Sync status indicator | Critical | `COMPLETED` | `FR-112`, `NFR-030` |
| 12.3 Sync conflict resolution UX | Important | `COMPLETED` | `FR-113`, addendum conflict UX contract |
| 12.4 Error states and error handling UX | Important | `COMPLETED` | `FR-114`, addendum error UX contract |
| 12.5 Empty states for all views | Important | `COMPLETED` | `FR-114`, addendum empty-state contract |
| 12.6 First-run onboarding | Important | `COMPLETED` | `FR-115`, addendum onboarding UX contract |
| 12.7 Notification history/inbox | Important | `COMPLETED` | `FR-100` |
| 12.8 Loading states and skeleton screens | Nice-to-Have | `COMPLETED` | `FR-114`, addendum loading UX contract |
| 13.1 Bulk selection and actions | Important | `COMPLETED` | `FR-118`, `NFR-029` |
| 13.2 Quick-add / rapid entry | Important | `COMPLETED` | `FR-119` |
| 13.3 Recurring/repeating tasks | Important | `COMPLETED` | `FR-120`, addendum Recurring Task Definition model (2.11), `FR-072` updated with `recurrence_id` |
| 13.4 Pagination and virtualization | Important | `COMPLETED` | `FR-123`, `NFR-028` |
| 13.5 Storage limits and quotas | Important | `COMPLETED` | `FR-124`, `NFR-032` |
| 13.6 Custom ordering in Kanban columns | Important | `COMPLETED` | `FR-121`, `FR-072` updated with `kanban_sort_order`, addendum validation rule 12 |
| 13.7 Deletion and recovery | Important | `COMPLETED` | `FR-122`, addendum validation rule 10 (30-day auto-purge) |
| 13.8 Task/project templates | Nice-to-Have | `DEFERRED_POST_MVP` | Added to out-of-scope in `docs/scope/02-mvp-scope.md` |

## Additional Item Statuses

| Gap | Priority | Status | Resolution |
| --- | --- | --- | --- |
| Gantt/Timeline View | Nice-to-Have | `DEFERRED_POST_MVP` | Added to out-of-scope in `docs/scope/02-mvp-scope.md` |
| @Mentions in Comments | Nice-to-Have | `DEFERRED_POST_MVP` | Explicitly deferred for MVP in scope guardrails |
| Dashboard Customization / Saved Filters | Nice-to-Have | `DEFERRED_POST_MVP` | Added to out-of-scope in `docs/scope/02-mvp-scope.md` |
| Duplicate Detection | Nice-to-Have | `DEFERRED_POST_MVP` | Added to out-of-scope in `docs/scope/02-mvp-scope.md` |
| Localization/i18n | Nice-to-Have / Important timezone | `DEFERRED_POST_MVP` | i18n deferred; timezone correctness remains tracked in open questions |
| Task Effort/Size Estimation | Nice-to-Have | `DEFERRED_POST_MVP` | Added to out-of-scope in `docs/scope/02-mvp-scope.md` |
| FR Numbering Gaps | Documentation | `COMPLETED` | Clarified in `docs/requirements/03-functional-requirements.md` note |
