import { Link } from 'react-router-dom'
import { useTagStore } from '@/stores/tagStore'
import type { Project } from '@shared/schemas'
import { Calendar, Folder } from 'lucide-react'
import { useFolderStore } from '@/stores/folderStore'

interface ProjectCardProps {
  project: Project
}

function statusColor(status: string): string {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-500'
    case 'On Hold':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'Completed':
      return 'bg-blue-500/10 text-blue-500'
    case 'Archived':
      return 'bg-zinc-500/10 text-zinc-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

export function ProjectCard({ project }: ProjectCardProps): JSX.Element {
  const allTags = useTagStore((s) => s.tags)
  const allFolders = useFolderStore((s) => s.folders)

  const projectTags = allTags.filter((t) => project.tag_ids.includes(t.tag_id))
  const folder = project.folder_id
    ? allFolders.find((f) => f.folder_id === project.folder_id)
    : null

  return (
    <Link
      to={`/projects/${project.project_id}`}
      className="block rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground truncate">{project.name}</h3>
        <span
          className={`shrink-0 ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(project.status)}`}
        >
          {project.status}
        </span>
      </div>

      {project.description && (
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Tags */}
      {projectTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {projectTags.slice(0, 5).map((tag) => (
            <span
              key={tag.tag_id}
              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
          {projectTags.length > 5 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground">
              +{projectTags.length - 5}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(project.start_date)}</span>
          <span className="mx-0.5">-</span>
          <span>{formatDate(project.target_end_date)}</span>
        </div>
        {folder && (
          <div className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            <span className="truncate">{folder.name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
