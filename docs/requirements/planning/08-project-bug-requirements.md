# 08. Project Bug Tracking Requirements Addendum

## 1. Objective

Define planning-level requirements for tracking bugs inside projects with complete and consistent bug metadata.

This addendum refines requirement coverage for `FR-080` to `FR-087`.

## 2. Required Bug Fields (Planning Baseline)

| Field | Required | Notes |
| --- | --- | --- |
| `bug_id` | Yes | Unique immutable identifier. |
| `project_id` | Yes | Links bug to exactly one project. |
| `title` | Yes | Short bug summary. |
| `description` | Yes | Markdown-enabled bug details. |
| `status` | Yes | Suggested values: `New`, `Triaged`, `In Progress`, `Fixed`, `Verified`, `Closed`, `Reopened`. |
| `severity` | Yes | Suggested values: `Low`, `Medium`, `High`, `Critical`. |
| `priority` | Yes | Suggested values: `Low`, `Medium`, `High`, `Critical`. |
| `reporter` | Yes | User who reported the bug. |
| `assignee` | No | Nullable until triage or ownership assignment. |
| `environment` | Yes | Context such as platform/app version. |
| `steps_to_reproduce` | Yes | Reproduction steps. |
| `expected_result` | Yes | What should happen. |
| `actual_result` | Yes | What currently happens. |
| `reported_at` | Yes | Reported timestamp/date. |
| `target_fix_date` | No | Optional planned fix date. |
| `resolved_at` | No | Set when bug reaches fixed/closed state. |
| `created_at` | Yes | Audit timestamp. |
| `updated_at` | Yes | Audit timestamp. |

## 3. Relationship and Validation Rules

1. Every bug must include `project_id`; standalone bugs are out of scope.
2. `target_fix_date` (if provided) must be on/after `reported_at`.
3. `resolved_at` can be set only when status is `Fixed`, `Verified`, or `Closed`.
4. Project-level views can include both tasks and bugs but keep separate status semantics.

## 4. Workflow and Triage Rules

1. New bug default status is `New`.
2. Triage step sets initial severity, priority, and assignee.
3. Reopened bugs preserve original report history and update `updated_at`.
4. Closed bugs remain searchable for audit and regression tracking.

## 5. Implementation Planning Impact

1. `T18` is added for bug entity schema, CRUD, triage lifecycle, and project bug views (`FR-080` to `FR-087`).
2. `T10` uses bug data for portfolio-level reporting where relevant.
3. `T15` hardening includes bug-module performance and reliability checks.

## 6. Acceptance Checklist

1. User can create a bug in a selected project with all required fields.
2. Bug status, severity, priority, and assignee are editable with validation.
3. Bug date rules are enforced for `reported_at`, `target_fix_date`, and `resolved_at`.
4. Project views can list/filter bugs by status, severity, priority, and assignee.
5. Closed and reopened bug history remains visible for traceability.
