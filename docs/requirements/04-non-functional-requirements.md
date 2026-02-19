# 04. Non-Functional Requirements

## 1. Technology Stack

- `NFR-000`: Application must be built using **Electron** and **React**.
- `NFR-000b`: Backend and Data Sync must use **Firebase** (Authentication + Firestore).

## 2. Performance (Desktop)

- `NFR-001`: Application launch time should be under `2 seconds` on standard hardware.
- `NFR-002`: Local task create/update action should be instantaneous (`< 100ms` UI response).
- `NFR-003`: Search results across 100+ projects should appear within `0.5 seconds` (local index).
- `NFR-004`: Kanban board view should render smoothly at `60fps` during drag-and-drop.

## 3. Availability and Reliability (Offline-First)

- `NFR-005`: Application must be fully functional **Offline** for reading and writing data.
- `NFR-006`: Data must automatically sync with Firebase when internet connection is restored.
- `NFR-007`: Conflict resolution strategies must be defined for multi-device edits (Last-Write-Wins as MVP default).

## 4. Security

- `NFR-008`: All data in transit to Firebase must use TLS (handled by SDK).
- `NFR-009`: **Firebase Security Rules** must enforce that users can only access their own projects/organizations.
- `NFR-010`: Local data cache should be stored in standard application support directories.
- `NFR-011`: Sensitive configuration (API keys) must be handled according to Electron best practices (though Firebase config is generally public, admin keys must not be bundled).

## 5. Privacy and Compliance (Draft)

- `NFR-012`: User data handling should align with applicable privacy regulations for target regions.
- `NFR-013`: System should support account-level data export (`CSV`/`JSON`) and deletion workflows.

## 6. Usability and Accessibility

- `NFR-014`: First-time user can create a project and first task in under `5 minutes`.
- `NFR-015`: UI must support extensive **Keyboard Shortcuts** (Global Hotkeys, Quick Add).
- `NFR-016`: UI should target WCAG 2.1 AA baseline for color contrast and interaction patterns.
- `NFR-017`: Application must support System Dark/Light mode switching automatically.

## 7. Maintainability and Observability

- `NFR-018`: Client-side errors must be logged to a monitoring service (e.g., Sentry) in production.
- `NFR-019`: Auto-updater mechanism must be in place to deliver patches to users.

## 8. Distribution and Desktop Runtime

- `NFR-020`: Installers must be code-signed for supported desktop platforms.
- `NFR-021`: Import/Export operations for files up to `50 MB` should complete without app crash or UI freeze.
- `NFR-022`: Multi-window mode should remain responsive with at least 3 project windows open.
- `NFR-023`: Attachment handling must use safe file paths and block unsupported executable file types by policy.

## 9. Platform, Validation, and Scale Controls

- `NFR-024`: MVP must document supported desktop OS matrix and minimum versions, and preserve platform conventions for menus, shortcuts, and window behavior.
- `NFR-025`: Auth/session and invite-token handling must enforce secure expiration and revocation semantics.
- `NFR-026`: Activity/audit events must retain at least `180 days` of history and remain queryable by project/entity without full-table scans.
- `NFR-027`: Field limits and validation rules must be enforced consistently in both client and backend validation layers.
- `NFR-028`: High-volume task/bug views (`>=1000` items) must use pagination and/or virtualization to maintain smooth interaction on standard hardware.
- `NFR-029`: Bulk actions affecting up to `200` items should provide user feedback within `1 second` for local state updates.
- `NFR-030`: Sync-state indicators must refresh within `5 seconds` of connectivity or sync-state transitions.
- `NFR-031`: Undo/redo history should preserve at least `50` reversible actions per active window/session.
- `NFR-032`: Storage policies must define per-file attachment limits, local cache guardrails, and quota-warning thresholds before hard failures.
