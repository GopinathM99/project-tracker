# 07. Kanban Dashboard Requirements

## 1. Purpose

Provide Kanban-style dashboards so users can track and update work in two scopes:

1. Per-project Kanban.
2. Monthly Kanban for tasks due in the current month.

## 2. MVP Behavior

1. User can switch board scope between `Project Kanban` and `Monthly Kanban`.
2. `Project Kanban` is scoped to a single project.
3. `Monthly Kanban` includes tasks with `due_date` inside the current month; tasks without due date are excluded.
4. Columns are based on task status: `Not Started`, `In Progress`, `Blocked`, `Done`.
5. Task cards display title, owner, due date, and priority.
6. In `Monthly Kanban`, each card also displays project name.
7. Moving a card to another column updates status.
8. Board header shows progress indicators for the active scope:
   - Total tasks
   - Completed percentage
   - Blocked count
   - Overdue count

## 3. Filters and Views

1. Filter cards by owner.
2. Filter cards by priority.
3. Filter cards by due date window.
4. In `Monthly Kanban`, filter cards by project.
5. Quick toggle between list view and Kanban view.

## 4. Acceptance Criteria

1. User can open `Project Kanban` from a project page in one click.
2. User can open `Monthly Kanban` for the current month from global navigation.
3. Every included task appears in exactly one status column.
4. `Monthly Kanban` includes only tasks with due dates in the current month.
5. Status change via card move is reflected in metrics immediately.
6. Board state remains consistent after refresh.
7. Users without edit permissions can view but cannot move cards.

## 5. Deferred (Post-MVP)

1. Swimlanes by owner or milestone.
2. Custom workflow columns.
3. Work-in-progress limits.
4. Month navigation beyond the current month.
