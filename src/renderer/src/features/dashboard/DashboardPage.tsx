import { useMemo } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { PortfolioSummary } from './components/PortfolioSummary'
import { WeeklySummary } from './components/WeeklySummary'
import { MyTasks } from './components/MyTasks'
import { OverdueTasks } from './components/OverdueTasks'
import { UpcomingTasks } from './components/UpcomingTasks'
import { ProjectOverview } from './components/ProjectOverview'
import { BugSummary } from './components/BugSummary'
import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage(): JSX.Element {
  const { projects, allTasks, allBugs, loading } = useDashboard()

  const projectMap = useMemo(() => {
    const map = new Map<string, string>()
    projects.forEach((p) => map.set(p.project_id, p.name))
    return map
  }, [projects])

  if (loading) {
    return <LoadingState />
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No active projects"
        description="Create a project to start seeing your global dashboard with portfolio views."
      />
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Portfolio summary stats - full width */}
      <div className="mb-6">
        <PortfolioSummary
          activeProjectCount={projects.length}
          tasks={allTasks}
          bugs={allBugs}
        />
      </div>

      {/* Weekly Summary + Bug Summary - 2 columns */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <WeeklySummary tasks={allTasks} />
        <BugSummary bugs={allBugs} />
      </div>

      {/* My Tasks - full width */}
      <div className="mb-6">
        <MyTasks tasks={allTasks} projectMap={projectMap} />
      </div>

      {/* Overdue + Upcoming - 2 columns */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <OverdueTasks tasks={allTasks} projectMap={projectMap} />
        <UpcomingTasks tasks={allTasks} projectMap={projectMap} />
      </div>

      {/* Project Overview - full width */}
      <div className="mb-6">
        <ProjectOverview projects={projects} tasks={allTasks} />
      </div>
    </div>
  )
}
