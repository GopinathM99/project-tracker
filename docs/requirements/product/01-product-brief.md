# 01. Product Brief

## 1. Problem Statement

Teams and individuals struggle to track project progress when tasks, deadlines, and ownership are split across chats, spreadsheets, and notes.

The Project Tracker app should provide one place to plan projects, assign ownership, monitor status, and surface risks early.
It should also provide a Kanban-style view so teams can quickly see workflow state and project progress.

## 2. Product Vision

Create a thorough and reliable desktop project tracking tool that helps users answer three questions at any time:

1. What needs to be done?
2. Who is responsible?
3. Are we on track across all projects?

## 3. Target Users

1. Individual contributor managing personal project tasks.
2. Team lead managing multi-person project execution.
3. Project manager tracking milestones, status, and blockers across a portfolio.

## 4. Primary Goals

1. Reduce missed deadlines.
2. Improve visibility of project status.
3. Make accountability explicit through ownership.
4. Enable quick weekly or daily status updates.
5. Provide a visual Kanban board for fast progress tracking.
6. Provide comprehensive portfolio visibility and organization (Folders, Global Dashboard).

## 5. Success Metrics (Draft)

1. `>=80%` of created tasks have an owner and due date.
2. `>=70%` of active users update project/task status weekly.
3. `<=10%` of tasks pass due date without status update.
4. Time to create a project plan is under `10 minutes`.
5. Application launches and is ready to use in under `2 seconds`.

## 6. Assumptions (To Validate)

1. Initial release may support single workspace and basic collaboration.
2. Users need desktop-first access (Electron) with offline capabilities.
3. Native OS notifications are preferred over email for immediate alerts.
4. Basic role model (Owner, Member, Viewer) is sufficient for MVP.

## 7. Constraints

1. Keep MVP focused on planning + tracking, not full resource management.
2. Prioritize low onboarding friction.
3. Keep core flows usable without heavy customization.
4. Must work offline and sync when online (Firebase).
