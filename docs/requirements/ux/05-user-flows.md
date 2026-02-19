# 05. User Flows and Acceptance Criteria

## Flow 1: Create Project

1. User opens dashboard.
2. User selects `Create Project`.
3. User enters project details and saves.
4. System creates project and redirects to project overview.

Acceptance criteria:

1. Project appears in project list immediately after save.
2. Required fields are validated with clear error messages.
3. Audit fields capture creator and creation timestamp.

## Flow 2: Plan Tasks for Project

1. User opens project.
2. User adds tasks with owner, status, start date, expected completion date, optional due date, and priority.
3. User saves task list.

Acceptance criteria:

1. Task cannot be saved without title, status, project linkage, start date, and expected completion date.
2. Overdue tasks are visually identifiable.
3. Task updates appear without manual refresh.

## Flow 3: Track Progress

1. User opens project overview.
2. User checks completion, blocked, and overdue counts.
3. User drills into filtered task list.

Acceptance criteria:

1. Progress metrics reflect latest task states.
2. Filters maintain consistent results.
3. Empty states provide next-step guidance.

## Flow 4: Manage Work on Kanban Board

1. User opens Kanban and chooses mode: `Project Kanban` or `Monthly Kanban`.
2. System displays columns by status.
3. In monthly mode, system includes only tasks with due dates in the current month.
4. User moves tasks across columns as work progresses.
5. System updates task status and scope-specific progress metrics.

Acceptance criteria:

1. Every included task is visible in exactly one column.
2. In monthly mode, tasks without due date are excluded.
3. Moving a card updates status without page reload.
4. Board shows done percentage, blocked count, and overdue count for active scope.

## Flow 5: Weekly Status Review

1. Team lead opens weekly summary.
2. Team lead reviews completed and blocked tasks.
3. Team lead adds notes/comments for follow-up.

Acceptance criteria:

1. Weekly summary covers previous 7 days by default.
2. Blocked tasks are clearly separated from in-progress tasks.
3. Status view is exportable or shareable (format TBD in open questions).

## Flow 6: Track All Tasks on Calendar

1. User opens global calendar view.
2. System displays tasks from all active projects in selected calendar mode (`Month`, `Week`, or `Day`).
3. User filters by project, status, or owner to focus view.
4. User clicks a task to open full task details in project context.

Acceptance criteria:

1. Calendar includes top-level tasks from all active projects by default.
2. Status and overdue states are visually distinct.
3. Calendar item interaction opens the same task detail view as project task lists.

## Flow 7: Report and Triage Project Bugs

1. User opens a project and selects `Report Bug`.
2. User enters required bug fields and saves.
3. System creates the bug in `New` status.
4. User or project lead triages by setting severity, priority, and assignee.
5. Team updates bug status through resolution lifecycle.

Acceptance criteria:

1. Bug cannot be saved without required bug fields.
2. Bug must always remain linked to one project.
3. Bug lists support filtering by status, severity, priority, and assignee.
