import { useState, useMemo } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useCanWrite } from '@/hooks/usePermission'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProjectCard } from './components/ProjectCard'
import { CreateProjectDialog } from './components/CreateProjectDialog'
import { CreateFolderDialog } from './components/CreateFolderDialog'
import { CreateTagDialog } from './components/CreateTagDialog'
import { FolderSidebar } from './components/FolderSidebar'
import { Plus, FolderPlus, Tags, X } from 'lucide-react'

export default function ProjectListPage(): JSX.Element {
  const { projects, loading } = useProjects()
  const { folders, loading: foldersLoading } = useFolders()
  const { tags, loading: tagsLoading } = useTags()
  const canWrite = useCanWrite()
  const [showCreate, setShowCreate] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Filter projects by selected tags
  const filteredProjects = useMemo(() => {
    if (selectedTagIds.length === 0) return projects
    return projects.filter((p) =>
      selectedTagIds.some((tagId) => p.tag_ids.includes(tagId)),
    )
  }, [projects, selectedTagIds])

  function toggleTagFilter(tagId: string): void {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    )
  }

  if (loading || foldersLoading || tagsLoading) {
    return <LoadingState />
  }

  if (projects.length === 0) {
    return (
      <>
        <EmptyState
          title="No projects yet"
          description="Your projects will appear here. Create your first project to get started."
          action={
            canWrite
              ? { label: 'Create Project', onClick: () => setShowCreate(true) }
              : undefined
          }
        />
        <CreateProjectDialog open={showCreate} onClose={() => setShowCreate(false)} />
      </>
    )
  }

  return (
    <div className="flex h-full">
      {/* Folder Sidebar */}
      {folders.length > 0 || canWrite ? (
        <div className="w-64 shrink-0 border-r border-border p-3 overflow-y-auto">
          <FolderSidebar
            projects={filteredProjects}
            onCreateFolder={() => setShowCreateFolder(true)}
          />
        </div>
      ) : null}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <div className="flex items-center gap-2">
            {canWrite && (
              <>
                <button
                  onClick={() => setShowCreateTag(true)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Tags className="h-4 w-4" />
                  New Tag
                </button>
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <FolderPlus className="h-4 w-4" />
                  New Folder
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tag filter chips */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filter by tag:</span>
            {tags.map((tag) => {
              const isActive = selectedTagIds.includes(tag.tag_id)
              return (
                <button
                  key={tag.tag_id}
                  onClick={() => toggleTagFilter(tag.tag_id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'border border-border bg-card text-foreground hover:bg-accent'
                  }`}
                  style={isActive ? { backgroundColor: tag.color } : undefined}
                >
                  {!isActive && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  {tag.name}
                  {isActive && <X className="ml-0.5 h-3 w-3" />}
                </button>
              )
            })}
            {selectedTagIds.length > 0 && (
              <button
                onClick={() => setSelectedTagIds([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.project_id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && selectedTagIds.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">No projects match the selected tags.</p>
            <button
              onClick={() => setSelectedTagIds([])}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <CreateProjectDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <CreateFolderDialog open={showCreateFolder} onClose={() => setShowCreateFolder(false)} />
      <CreateTagDialog open={showCreateTag} onClose={() => setShowCreateTag(false)} />
    </div>
  )
}
