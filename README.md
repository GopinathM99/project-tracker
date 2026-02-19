# Project Tracker

A desktop project tracking application that helps teams answer three questions at any time: **What needs to be done? Who is responsible? Are we on track?**

Built with Electron, React, TypeScript, and Firebase.

## Features

- **Project Management** — Create projects, organize with folders and tags, track milestones and progress
- **Task Tracking** — Priorities, due dates, assignees, subtasks, dependencies, and recurring tasks
- **Bug Tracking** — Severity/priority triage, reproduction steps, environment details, resolution workflow
- **Kanban Boards** — Drag-and-drop cards with within-column reordering, project and monthly views
- **Global Calendar** — Visualize tasks, bugs, and milestones across all projects on a calendar
- **Portfolio Dashboard** — Workspace-wide metrics, charts, and overdue/upcoming summaries
- **Cross-Project Search** — Instant full-text search across projects, tasks, and bugs with filters
- **Real-Time Collaboration** — Workspace roles (Owner/Member/Viewer), member invites, Markdown comments
- **Activity Trail** — Automatic change logging with per-entity activity feeds
- **In-App Notifications** — Assignment changes, status updates, comments, and overdue alerts
- **Bulk Actions** — Multi-select tasks/bugs for batch status, priority, or owner updates
- **Attachments & Export** — File attachments with drag-and-drop, JSON/CSV data export
- **Entity Links** — Cross-reference tasks, bugs, and projects with typed relationships
- **Trash & Recovery** — Soft-delete with 30-day retention and restore capability
- **Offline Support** — Full read/write offline with automatic sync on reconnect
- **Multi-Window** — Open projects in separate windows for side-by-side work
- **Keyboard Shortcuts** — Cmd/Ctrl+K search, Cmd/Ctrl+Z undo, sidebar toggle, and more
- **Theming** — System, Light, and Dark modes with user preferences
- **Accessibility** — WCAG 2.1 AA baseline, skip navigation, ARIA labels, keyboard navigation

## Prerequisites

- **Node.js** 20+ and npm
- **Firebase project** with Authentication and Firestore enabled

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
2. Enable **Authentication** with the **Email/Password** sign-in provider.
3. Create a **Firestore Database** (start in test mode for development).
4. Go to Project Settings > General > Your Apps > Add a **Web App**.
5. Copy the Firebase configuration values.
6. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

7. Fill in your Firebase project values:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Deploy Firestore Security Rules

```bash
npx firebase deploy --only firestore:rules
```

### 4. Run in development

```bash
npm run dev
```

This starts the Electron app with hot-reload for the React renderer.

### 5. Build for production

```bash
npm run package:mac     # macOS (DMG + ZIP)
npm run package:win     # Windows (NSIS + ZIP)
npm run package:linux   # Linux (AppImage + DEB)
```

Output goes to the `dist/` directory.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Electron app in development mode with HMR |
| `npm run build` | Build main, preload, and renderer bundles |
| `npm run package` | Build and package for the current platform |
| `npm run package:mac` | Build and package for macOS (DMG + ZIP) |
| `npm run package:win` | Build and package for Windows (NSIS + ZIP) |
| `npm run package:linux` | Build and package for Linux (AppImage + DEB) |
| `npm run package:all` | Build and package for all platforms |
| `npm run release` | Build, package, and publish a release |
| `npm run clean` | Remove build artifacts (`out/`, `dist/`) |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## Project Structure

```
src/
├── main/                        # Electron main process
│   ├── index.ts                 # App lifecycle and startup
│   ├── windows.ts               # Multi-window management + CSP
│   ├── menu.ts                  # Native menu bar with shortcuts
│   └── ipc/                     # IPC handler registrations
├── preload/                     # Context bridge (secure renderer API)
│   ├── index.ts                 # Exposed electronAPI
│   └── index.d.ts               # Type declarations
├── renderer/                    # React application
│   └── src/
│       ├── App.tsx              # Root component with error boundary
│       ├── routes/              # Route definitions with lazy loading
│       ├── components/
│       │   ├── layout/          # AppShell, Sidebar, TopBar, SyncStatus
│       │   ├── shared/          # ErrorBoundary, LoadingState, EmptyState
│       │   ├── auth/            # AuthGuard, WorkspaceGuard
│       │   └── ui/              # shadcn/ui primitives
│       ├── features/
│       │   ├── auth/            # Login, Sign Up, Forgot Password, Workspace Setup
│       │   ├── projects/        # Project list, detail, CRUD
│       │   ├── tasks/           # Task list, detail, quick add, bulk actions
│       │   ├── bugs/            # Bug list, detail, bulk actions
│       │   ├── kanban/          # Project Kanban + Monthly Kanban boards
│       │   ├── calendar/        # Global calendar view
│       │   ├── dashboard/       # Portfolio dashboard with metrics
│       │   ├── search/          # Cross-project search with filters
│       │   ├── settings/        # Profile, Preferences, Shortcuts, Members, Storage
│       │   ├── notifications/   # Notification inbox
│       │   ├── activity/        # Activity feed timeline
│       │   ├── onboarding/      # First-run onboarding wizard
│       │   ├── recurring/       # Recurring task management
│       │   ├── trash/           # Soft-deleted item recovery
│       │   └── bulk-actions/    # Bulk action bar component
│       ├── services/            # Firebase Firestore CRUD + business logic
│       ├── stores/              # Zustand state stores
│       ├── hooks/               # Shared React hooks
│       ├── lib/                 # Firebase init, error logger, utilities
│       └── styles/              # Tailwind CSS globals
└── shared/                      # Code shared across all processes
    ├── schemas/                 # 17 Zod entity schemas
    ├── constants/               # Validation limits, roles, sync, privacy
    ├── types/                   # IPC channel types
    └── utils/                   # ID generation, permissions, helpers
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop Runtime | Electron 34 |
| UI Framework | React 19 + TypeScript 5.7 |
| Build Tooling | electron-vite 3 + electron-builder 25 |
| Backend / Database | Firebase 11 (Auth + Firestore) |
| Offline Persistence | Firestore `persistentLocalCache` with multi-tab manager |
| State Management | Zustand 5 (UI) + Firestore real-time listeners (server) |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix primitives) |
| Routing | React Router 7 (HashRouter for Electron `file://` protocol) |
| Validation | Zod 3 (17 entity schemas with refinements) |
| Testing | Vitest 3 (376 unit tests) + Playwright (E2E) |
| CI/CD | GitHub Actions (typecheck, test, build, package) |

## Data Model

17 entities scoped to workspaces via Firestore subcollections (`workspaces/{id}/...`):

| Entity | Description |
| --- | --- |
| Workspace | Top-level container for all project data |
| Workspace Member | User membership with role (Owner/Member/Viewer) |
| Project | Groups tasks, bugs, and milestones |
| Task | Work item with status, priority, dates, assignee |
| Bug | Defect report with severity, environment, resolution |
| Milestone | Project checkpoint with target date and progress |
| Comment | Markdown-formatted discussion on any entity |
| Folder | Hierarchical project organization (3 levels max) |
| Tag | Color-coded labels for categorization |
| Attachment | File references stored in local app data |
| Dependency Link | Task-to-task blocking relationships |
| Entity Link | Cross-entity references (related, blocks, duplicates) |
| Recurring Task Definition | Template + schedule for auto-generated tasks |
| Activity Event | Audit log entry for entity changes |
| Notification | In-app alert for assignments, status changes, comments |
| User Preferences | Per-user theme, default view, notification settings |
| Invite | Workspace invitation with hashed token and expiry |

Schemas are defined in `src/shared/schemas/` using Zod with validation refinements for date constraints and field limits.

## Security

- **Authentication**: Firebase Auth with email/password, session recovery, and password reset
- **Authorization**: Role-based access control (Owner, Member, Viewer) enforced in Firestore security rules
- **Content Security Policy**: Applied in production builds to restrict script/connect sources
- **Context Isolation**: Electron preload bridge with `contextIsolation: true` and `nodeIntegration: false`
- **Code Signing**: macOS hardened runtime with notarization support; Windows and Linux signing via environment variables
- **Data Privacy**: Sensitive fields excluded from error logging; no PII in monitoring payloads

## Packaging and Release

### Code Signing (macOS)

Set these environment variables before packaging:

```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your-certificate-password
export APPLE_ID=your@apple.id
export APPLE_APP_SPECIFIC_PASSWORD=your-app-specific-password
export APPLE_TEAM_ID=your-team-id
```

### Code Signing (Windows)

```bash
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your-certificate-password
```

### Production Firebase Config

Copy the production template and fill in your production Firebase project values:

```bash
cp .env.production .env
```

### Build Icons

Place app icons in the `resources/` directory:

- `icon.png` — 512x512 PNG (macOS/Linux)
- `icon.ico` — 256x256 ICO (Windows)
- `icon.icns` — macOS .icns bundle

## Documentation

- `docs/requirements/product/01-product-brief.md` — Vision and goals
- `docs/requirements/scope/02-mvp-scope.md` — MVP scope boundaries
- `docs/requirements/03-functional-requirements.md` — 124 functional requirements (FR-001 to FR-124)
- `docs/requirements/04-non-functional-requirements.md` — 32 non-functional requirements (NFR-000 to NFR-032)
- `docs/implementation/01-implementation-plan.md` — Full delivery sequence with dependency map

## License

MIT
