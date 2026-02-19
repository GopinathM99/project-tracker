# 09. Kanban Modes Requirements Addendum

## 1. Objective

Define planning-level behavior for dual Kanban modes:

1. Project-level Kanban.
2. Monthly Kanban for tasks due in the current month.

This addendum refines requirement coverage for `FR-088` to `FR-091`.

## 2. Kanban Modes

| Mode | Scope | Inclusion Rule |
| --- | --- | --- |
| `Project Kanban` | One selected project | All tasks in that project. |
| `Monthly Kanban` | Cross-project | Tasks with `due_date` in current calendar month only. |

## 3. Monthly Kanban Rules

1. Task must have a non-null `due_date`.
2. `due_date` month/year must equal current month/year in app timezone.
3. Task status columns remain `Not Started`, `In Progress`, `Blocked`, `Done`.
4. Card click opens task detail in its project context.

## 4. Required Card Fields

1. `title`
2. `owner`
3. `due_date`
4. `priority`
5. `status`
6. `project_name` (required for monthly mode)

## 5. Implementation Planning Impact

1. `T08` expands from project-only Kanban to dual-mode Kanban (`FR-021` to `FR-024`, `FR-088` to `FR-091`).
2. `T10` aggregation patterns can be reused to optimize `Monthly Kanban` queries at scale.
3. `T11` provides mode/filter navigation consistency for Kanban entry points.

## 6. Acceptance Checklist

1. User can switch between `Project Kanban` and `Monthly Kanban`.
2. Monthly board contains only current-month due-date tasks.
3. Tasks without due date are excluded from monthly mode.
4. Status updates via drag-and-drop behave consistently across both modes.
5. Task drill-down from monthly cards preserves project context.
