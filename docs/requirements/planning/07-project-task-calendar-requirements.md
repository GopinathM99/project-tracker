# 07. Project/Task + Calendar Planning Addendum

## 1. Objective

Capture the planning-level requirements for:

1. Defining projects with complete metadata.
2. Creating tasks that are explicitly linked to projects.
3. Tracking all project tasks in a single calendar view.

This addendum refines requirement coverage for `FR-071` to `FR-079`.

## 2. Required Project Fields (Planning Baseline)

| Field | Required | Notes |
| --- | --- | --- |
| `project_id` | Yes | Unique immutable identifier. |
| `name` | Yes | Human-readable project title. |
| `description` | Yes | Markdown-enabled summary of project scope. |
| `status` | Yes | Suggested values: `Planned`, `Active`, `On Hold`, `Completed`, `Archived`. |
| `owner` | Yes | Primary responsible user. |
| `start_date` | Yes | Planned start date. |
| `target_end_date` | Yes | Planned completion date. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

## 3. Required Task Fields (Planning Baseline)

| Field | Required | Notes |
| --- | --- | --- |
| `task_id` | Yes | Unique immutable identifier. |
| `project_id` | Yes | Links task to exactly one project. |
| `parent_task_id` | No | Nullable; populated only for subtasks. |
| `title` | Yes | Short task summary. |
| `description` | Yes | Detailed markdown-enabled task notes. |
| `status` | Yes | Suggested values: `Not Started`, `In Progress`, `Blocked`, `Done`. |
| `start_date` | Yes | Planned task start. |
| `expected_completion_date` | Yes | Target completion (planning date). |
| `due_date` | No | Optional hard deadline. |
| `priority` | Yes | Suggested values: `Low`, `Medium`, `High`, `Critical`. |
| `owner` | Yes | Primary assignee. |
| `recurrence_id` | No | Back-reference to recurring task definition (see addendum 2.11). Null for non-recurring tasks. |
| `kanban_sort_order` | No | Float value for manual within-column ordering on Kanban boards. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

## 4. Relationship and Validation Rules

1. A top-level task must have `project_id` and a null `parent_task_id`.
2. A subtask must have both `project_id` and `parent_task_id`.
3. `expected_completion_date` must be on/after `start_date`.
4. `due_date` (if provided) must be on/after `start_date`.
5. Calendar reads tasks across all active projects by default.

## 5. Calendar Planning Requirements

1. Global calendar surface includes tasks across all projects (`FR-075`).
2. Calendar view modes include `Month`, `Week`, and `Day` (`FR-076`).
3. User can filter by project, status, and owner (`FR-077`).
4. Selecting a task from calendar opens full task details in project context (`FR-078`).
5. Calendar visuals highlight `Not Started`, `In Progress`, `Blocked`, `Done`, and overdue tasks (`FR-079`).

## 6. Implementation Planning Impact

1. `T04` remains responsible for core project/task schema and CRUD (`FR-001` to `FR-009`, `FR-071` to `FR-074`).
2. `T10` remains responsible for cross-project aggregation needed by calendar data feeds.
3. `T17` is added for global calendar UX and interactions (`FR-075` to `FR-079`).

## 7. Acceptance Checklist

1. Project create/edit flows capture all required project fields.
2. Task create/edit flows capture required task fields and enforce date validation.
3. Top-level and subtask linkage rules are enforced.
4. Calendar shows tasks from all active projects without missing project context.
5. Calendar filters and view modes are verified in QA criteria.
