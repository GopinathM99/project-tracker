# 10. Extended Data Models and UX Addendum

## 1. Objective

Define missing entity models and UX contracts required by:

- `FR-092` to `FR-124`
- `NFR-024` to `NFR-032`

This addendum closes gaps for identity/workspace flows, activity traceability, validation constraints, desktop UX completeness, recurring task definitions, cross-entity traceability links, invite lifecycle, and user preferences.

## 2. Missing Entity Field Definitions

### 2.1 Workspace

| Field | Required | Notes |
| --- | --- | --- |
| `workspace_id` | Yes | Unique immutable identifier. |
| `name` | Yes | Workspace display name. |
| `slug` | Yes | Human-readable unique key for links/invites. |
| `owner_user_id` | Yes | Current workspace owner. |
| `plan_tier` | No | Optional (`Free`, `Pro`, etc.). |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.2 Workspace Member

| Field | Required | Notes |
| --- | --- | --- |
| `membership_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Parent workspace reference. |
| `user_id` | Yes | Member user reference. |
| `role` | Yes | `Owner`, `Member`, `Viewer`. |
| `status` | Yes | `Active`, `Suspended`, `Removed`. |
| `invited_by` | No | User who sent invite. |
| `invited_at` | No | Invite timestamp. |
| `accepted_at` | No | Join timestamp. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.3 Milestone

| Field | Required | Notes |
| --- | --- | --- |
| `milestone_id` | Yes | Unique immutable identifier. |
| `project_id` | Yes | Parent project reference. |
| `title` | Yes | Milestone name. |
| `description` | No | Optional markdown details. |
| `status` | Yes | `Planned`, `In Progress`, `Completed`, `Delayed`. |
| `start_date` | No | Planned start. |
| `target_date` | Yes | Planned milestone date. |
| `completed_at` | No | Set when completed. |
| `owner` | No | Optional milestone owner. |
| `linked_task_ids` | No | List of related tasks. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.4 Comment

| Field | Required | Notes |
| --- | --- | --- |
| `comment_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Workspace scope for access control. |
| `entity_type` | Yes | `Task`, `Bug`, `Project`. |
| `entity_id` | Yes | Referenced item ID. |
| `author_user_id` | Yes | Comment creator. |
| `content_markdown` | Yes | Comment body. |
| `is_edited` | Yes | Edit marker for UX. |
| `edited_at` | No | Timestamp if edited. |
| `deleted_at` | No | Soft delete marker. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.5 Folder

| Field | Required | Notes |
| --- | --- | --- |
| `folder_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Parent workspace reference. |
| `name` | Yes | Folder label. |
| `parent_folder_id` | No | Nullable for root-level folders. |
| `sort_order` | Yes | Sidebar ordering index. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.6 Tag

| Field | Required | Notes |
| --- | --- | --- |
| `tag_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Tag namespace scope. |
| `name` | Yes | Tag label (case-insensitive unique per workspace). |
| `color` | Yes | Hex color for UI display. |
| `scope` | Yes | `Global` or `Project`. |
| `project_id` | No | Required only when `scope=Project`. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.7 Attachment

| Field | Required | Notes |
| --- | --- | --- |
| `attachment_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Workspace scope for access control. |
| `entity_type` | Yes | `Task`, `Bug`, `Project`, `Comment`. |
| `entity_id` | Yes | Linked entity ID. |
| `file_name` | Yes | Original file name. |
| `mime_type` | Yes | MIME content type. |
| `file_size_bytes` | Yes | Stored file size. |
| `storage_provider` | Yes | `Local`, `FirebaseStorage`. |
| `storage_path` | Yes | Relative file/storage path. |
| `thumbnail_path` | No | Optional generated thumbnail pointer. |
| `uploaded_by` | Yes | User who uploaded file. |
| `uploaded_at` | Yes | Upload timestamp. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.8 Dependency Link

| Field | Required | Notes |
| --- | --- | --- |
| `dependency_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Workspace scope for policy enforcement. |
| `from_task_id` | Yes | Upstream dependency source. |
| `to_task_id` | Yes | Downstream blocked task. |
| `relation_type` | Yes | MVP: `Finish-to-Start`. Reserved for future expansion. |
| `is_cross_project` | Yes | MVP requires `false`. |
| `created_by` | Yes | User creating the dependency. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

### 2.9 Activity Event

| Field | Required | Notes |
| --- | --- | --- |
| `event_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Workspace scope. |
| `actor_user_id` | Yes | User triggering event. |
| `entity_type` | Yes | `Workspace`, `Project`, `Task`, `Bug`, `Milestone`, `Comment`. |
| `entity_id` | Yes | Target entity ID. |
| `action` | Yes | `Created`, `Updated`, `Deleted`, `Restored`, `StatusChanged`, etc. |
| `change_summary` | Yes | Human-readable summary for UI trail. |
| `metadata` | No | Optional structured payload for diff/detail. |
| `created_at` | Yes | Event timestamp. |

### 2.10 Notification

| Field | Required | Notes |
| --- | --- | --- |
| `notification_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Workspace scope. |
| `recipient_user_id` | Yes | Target user. |
| `trigger_type` | Yes | `Reminder`, `Overdue`, `Assignment`, `Comment`, `Invite`, `StatusChange`, `PriorityChange`. |
| `entity_type` | Yes | Linked item type. |
| `entity_id` | Yes | Linked item ID. |
| `title` | Yes | Notification title text. |
| `body` | Yes | Notification body text. |
| `is_read` | Yes | Read state in in-app inbox. |
| `delivered_os` | Yes | OS notification delivery state. |
| `created_at` | Yes | Notification created timestamp. |
| `read_at` | No | Timestamp for read state transition. |

### 2.11 Recurring Task Definition

| Field | Required | Notes |
| --- | --- | --- |
| `recurrence_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Workspace scope. |
| `project_id` | Yes | Parent project for generated instances. |
| `template_task_id` | Yes | Source task whose fields are cloned for each instance. |
| `interval_type` | Yes | `Daily`, `Weekly`, `Monthly`, `Custom`. |
| `interval_value` | Yes | Repeat every N units (e.g., `2` = every 2 weeks when `interval_type=Weekly`). |
| `days_of_week` | No | Applicable when `interval_type=Weekly`. Array of weekday values. |
| `day_of_month` | No | Applicable when `interval_type=Monthly`. Day number (`1`–`31`). |
| `end_type` | Yes | `Never`, `AfterCount`, `OnDate`. |
| `end_after_count` | No | Required when `end_type=AfterCount`. Max instances to generate. |
| `end_on_date` | No | Required when `end_type=OnDate`. No instances generated after this date. |
| `next_generation_date` | Yes | Date of the next instance to be created by the scheduler. |
| `is_active` | Yes | Whether the recurrence is enabled. |
| `created_by` | Yes | User who created the recurrence. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

Generated instances carry a `recurrence_id` back-reference on the task record. Edits to the template task do not retroactively change already-generated instances; only future instances pick up template changes.

### 2.12 Entity Link

| Field | Required | Notes |
| --- | --- | --- |
| `link_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Workspace scope. |
| `from_entity_type` | Yes | `Task` or `Bug`. |
| `from_entity_id` | Yes | Source entity ID. |
| `to_entity_type` | Yes | `Task` or `Bug`. |
| `to_entity_id` | Yes | Target entity ID. |
| `relation_label` | Yes | `RelatedBug`, `FixTask`, `Related`, or custom label. |
| `is_bidirectional` | Yes | If `true`, link is visible from both sides. Default `true`. |
| `created_by` | Yes | User who created the link. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

This model covers `FR-104` (bug-task traceability). The Dependency Link model (section 2.8) remains the dedicated structure for task-to-task scheduling dependencies (`FR-052`/`FR-053`). Entity Links are for traceability, not blocking semantics.

### 2.13 Invite

| Field | Required | Notes |
| --- | --- | --- |
| `invite_id` | Yes | Unique immutable identifier. |
| `workspace_id` | Yes | Target workspace. |
| `invited_email` | Yes | Recipient email address (may not have an account yet). |
| `role` | Yes | Role to assign on acceptance: `Owner`, `Member`, `Viewer`. |
| `status` | Yes | `Pending`, `Accepted`, `Expired`, `Revoked`. |
| `token_hash` | Yes | Hashed invite token for secure verification. |
| `expires_at` | Yes | Token expiration timestamp. |
| `invited_by` | Yes | User who sent the invite. |
| `accepted_by_user_id` | No | Set when invite is accepted. |
| `accepted_at` | No | Timestamp of acceptance. |
| `revoked_at` | No | Timestamp if revoked by workspace admin. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

On acceptance, a corresponding Workspace Member record (section 2.2) is created. Expired and revoked invites are retained for audit purposes.

### 2.14 User Preferences

| Field | Required | Notes |
| --- | --- | --- |
| `user_id` | Yes | Primary key, matches Firebase Auth UID. |
| `workspace_id` | Yes | Preferences are per-user-per-workspace. |
| `theme` | Yes | `System`, `Light`, `Dark`. Default `System`. |
| `default_view` | Yes | Preferred landing view: `Dashboard`, `Kanban`, `Calendar`, `TaskList`. Default `Dashboard`. |
| `notification_reminders` | Yes | Enable due-date reminders. Default `true`. |
| `notification_overdue` | Yes | Enable overdue alerts. Default `true`. |
| `notification_assignments` | Yes | Enable assignment change alerts. Default `true`. |
| `notification_comments` | Yes | Enable new-comment alerts. Default `true`. |
| `notification_status_changes` | Yes | Enable status/priority change alerts. Default `true`. |
| `sidebar_collapsed` | No | Sidebar state preference. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

Keyboard shortcut overrides, if supported, are stored as a `custom_shortcuts` JSON map on this record. Settings screen sections (`FR-111`) read and write to this entity.

## 3. Validation and Limit Baseline

1. Project date rule: `target_end_date >= start_date`.
2. Task date rule: `start_date <= expected_completion_date <= project.target_end_date`.
3. Task due-date rule: if present, `due_date >= start_date` and `due_date <= project.target_end_date`.
4. Bug date rule: if present, `target_fix_date >= reported_at` and within project active date window.
5. Subtask depth limit: max depth `5` levels (including root level).
6. Dependency cycle prevention: system rejects any create/update producing a graph cycle.
7. Baseline text field limits:
   - Project/Task/Bug/Milestone title: `200` chars.
   - Description fields: `20000` chars.
   - Comment body: `5000` chars.
8. Baseline count limits:
   - Attachments per entity: `20`.
   - Tags per project/task/bug: `15`.
   - Bulk action max selection: `200`.
9. Folder nesting depth limit: max depth `3` levels (including root level).
10. Trash auto-purge policy: soft-deleted entities are permanently purged after `30` days. Users can manually purge earlier from the trash view.
11. Entity link limit: max `20` links per entity (task or bug).
12. Kanban within-column ordering: tasks carry a `kanban_sort_order` float field per board scope, updated on drag-and-drop reorder.

## 4. Desktop UX Contracts

1. Settings screen sections: `General`, `Notifications`, `Appearance`, `Keyboard Shortcuts`, `Account`, `Data and Sync`.
2. Sync states shown globally: `Offline`, `Syncing`, `In Sync`, `Sync Error`.
3. Conflict UX: overwritten local edits must surface a user-visible event in activity trail and notifications inbox.
4. Error UX: all failed actions show contextual error message plus retry path where applicable.
5. Empty-state UX: every major list/board/calendar/search/dashboard surface includes guided CTA when empty.
6. Loading UX: long-running loads/sync operations show spinner or skeleton plus progress text when available.
7. Onboarding UX: first-run flow creates workspace, first project, and first task without leaving wizard context.
8. Menu bar baseline:
   - `File`: new/open/import/export/quit
   - `Edit`: undo/redo/cut/copy/paste/find
   - `View`: dashboard/kanban/calendar/toggle sidebar/reload
   - `Window`: new window/close/minimize
   - `Help`: docs/shortcuts/report issue

## 5. Scope Decisions for Deferred Items

1. Visual print/PDF report export: deferred to Post-MVP (data export via `CSV/JSON` remains in MVP).
2. Bug Kanban board: deferred to Post-MVP (project bug list and filters remain in MVP).
3. Cross-project task dependencies: deferred to Post-MVP (MVP dependencies are same-project only).
4. Task/project templates: deferred to Post-MVP.
