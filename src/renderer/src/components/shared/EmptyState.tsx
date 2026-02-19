interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
