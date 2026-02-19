import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { WorkspaceGuard } from '@/components/auth/WorkspaceGuard'
import { LoadingState } from '@/components/shared/LoadingState'

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const ProjectListPage = lazy(() => import('@/features/projects/ProjectListPage'))
const ProjectDetailPage = lazy(() => import('@/features/projects/ProjectDetailPage'))
const TaskDetailPage = lazy(() => import('@/features/tasks/TaskDetailPage'))
const KanbanPage = lazy(() => import('@/features/kanban/KanbanPage'))
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage'))
const SearchPage = lazy(() => import('@/features/search/SearchPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'))
const BugDetailPage = lazy(() => import('@/features/bugs/BugDetailPage'))
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const SignUpPage = lazy(() => import('@/features/auth/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const WorkspaceSetupPage = lazy(() => import('@/features/auth/WorkspaceSetupPage'))
const AcceptInvitePage = lazy(() => import('@/features/auth/AcceptInvitePage'))
const TrashPage = lazy(() => import('@/features/trash/TrashPage'))

function Suspended({ children }: { children: React.ReactNode }): JSX.Element {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>
}

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <Suspended>
            <LoginPage />
          </Suspended>
        }
      />
      <Route
        path="/signup"
        element={
          <Suspended>
            <SignUpPage />
          </Suspended>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspended>
            <ForgotPasswordPage />
          </Suspended>
        }
      />

      {/* Authenticated routes */}
      <Route element={<AuthGuard />}>
        <Route
          path="/workspace-setup"
          element={
            <Suspended>
              <WorkspaceSetupPage />
            </Suspended>
          }
        />
        <Route
          path="/accept-invite"
          element={
            <Suspended>
              <AcceptInvitePage />
            </Suspended>
          }
        />

        {/* Workspace-scoped routes */}
        <Route element={<WorkspaceGuard />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Suspended>
                  <DashboardPage />
                </Suspended>
              }
            />
            <Route
              path="/projects"
              element={
                <Suspended>
                  <ProjectListPage />
                </Suspended>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <Suspended>
                  <ProjectDetailPage />
                </Suspended>
              }
            />
            <Route
              path="/projects/:projectId/tasks/:taskId"
              element={
                <Suspended>
                  <TaskDetailPage />
                </Suspended>
              }
            />
            <Route
              path="/projects/:projectId/kanban"
              element={
                <Suspended>
                  <KanbanPage />
                </Suspended>
              }
            />
            <Route
              path="/projects/:projectId/bugs/:bugId"
              element={
                <Suspended>
                  <BugDetailPage />
                </Suspended>
              }
            />
            <Route
              path="/kanban/monthly"
              element={
                <Suspended>
                  <KanbanPage />
                </Suspended>
              }
            />
            <Route
              path="/calendar"
              element={
                <Suspended>
                  <CalendarPage />
                </Suspended>
              }
            />
            <Route
              path="/search"
              element={
                <Suspended>
                  <SearchPage />
                </Suspended>
              }
            />
            <Route
              path="/settings/*"
              element={
                <Suspended>
                  <SettingsPage />
                </Suspended>
              }
            />
            <Route
              path="/notifications"
              element={
                <Suspended>
                  <NotificationsPage />
                </Suspended>
              }
            />
            <Route
              path="/trash"
              element={
                <Suspended>
                  <TrashPage />
                </Suspended>
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
