import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import {
  Rocket,
  FolderKanban,
  CheckSquare,
  Compass,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  SkipForward,
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: typeof Rocket
  content: JSX.Element
}

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()
  const workspaceId = useAppStore((s) => s.currentWorkspaceId)

  const markComplete = useCallback(() => {
    if (workspaceId) {
      localStorage.setItem(`onboarding-completed-${workspaceId}`, 'true')
    }
    onComplete()
  }, [workspaceId, onComplete])

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Project Tracker',
      description: 'Your all-in-one workspace for managing projects, tasks, and bugs.',
      icon: Rocket,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Project Tracker helps you stay organized with powerful features like Kanban boards,
            calendars, task dependencies, and real-time collaboration.
          </p>
          <p className="text-sm text-muted-foreground">
            Let us walk you through the basics to get you started.
          </p>
        </div>
      ),
    },
    {
      id: 'project',
      title: 'Create Your First Project',
      description: 'Projects are the foundation of your workspace.',
      icon: FolderKanban,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            A project groups related tasks, bugs, and milestones together. You can organize
            projects into folders and track progress on the dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            Head to the Projects page after onboarding to create your first project, or skip
            this step if you already have one.
          </p>
        </div>
      ),
    },
    {
      id: 'task',
      title: 'Add Tasks to Stay on Track',
      description: 'Break your work down into manageable tasks.',
      icon: CheckSquare,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Tasks can have priorities, due dates, assignees, tags, and subtasks. Track their
            progress through statuses like Not Started, In Progress, Blocked, and Done.
          </p>
          <p className="text-sm text-muted-foreground">
            Use the Kanban view to drag and drop tasks between status columns.
          </p>
        </div>
      ),
    },
    {
      id: 'explore',
      title: 'Explore Key Features',
      description: 'Discover the tools that make you productive.',
      icon: Compass,
      content: (
        <div className="space-y-3 text-left">
          <div className="rounded-md bg-accent/50 p-3">
            <p className="text-sm font-medium text-foreground">Dashboard</p>
            <p className="text-xs text-muted-foreground">
              See an overview of your workspace with metrics, recent activity, and upcoming tasks.
            </p>
          </div>
          <div className="rounded-md bg-accent/50 p-3">
            <p className="text-sm font-medium text-foreground">Kanban Board</p>
            <p className="text-xs text-muted-foreground">
              Visualize workflow with drag-and-drop cards organized by status.
            </p>
          </div>
          <div className="rounded-md bg-accent/50 p-3">
            <p className="text-sm font-medium text-foreground">Calendar</p>
            <p className="text-xs text-muted-foreground">
              View tasks and milestones on a calendar to manage deadlines.
            </p>
          </div>
          <div className="rounded-md bg-accent/50 p-3">
            <p className="text-sm font-medium text-foreground">Search</p>
            <p className="text-xs text-muted-foreground">
              Press Cmd+K (or Ctrl+K) to quickly find tasks, projects, and bugs.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'done',
      title: 'You are All Set!',
      description: 'Your workspace is ready to go.',
      icon: PartyPopper,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            You now know the essentials. Start by creating a project and adding your first
            tasks. You can always revisit settings to customize your experience.
          </p>
        </div>
      ),
    },
  ]

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  function handleNext(): void {
    if (isLast) {
      markComplete()
      navigate('/dashboard')
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  function handleBack(): void {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  function handleSkip(): void {
    markComplete()
    navigate('/dashboard')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-2xl">
        {/* Progress indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-2 w-8 rounded-full transition-colors',
                i <= currentStep ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <step.icon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{step.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
        </div>

        <div className="mb-8">{step.content}</div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div>
            {!isFirst && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLast && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isLast ? 'Go to Dashboard' : 'Next'}
              {!isLast && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
