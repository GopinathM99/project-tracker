import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFolders } from '@/hooks/useFolders'
import { useFolderStore } from '@/stores/folderStore'
import { useCanWrite } from '@/hooks/usePermission'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { folderService } from '@/services/folder-service'
import { projectService } from '@/services/project-service'
import { FIELD_LIMITS } from '@shared/constants/validation'
import type { Project, Folder } from '@shared/schemas'
import {
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRightLeft,
  X,
  Check,
} from 'lucide-react'

interface FolderSidebarProps {
  projects: Project[]
  onCreateFolder: () => void
}

interface FolderItemProps {
  folder: Folder
  projects: Project[]
  allFolders: Folder[]
  depth: number
  canWrite: boolean
  workspaceId: string | null
}

function FolderItem({
  folder,
  projects,
  allFolders,
  depth,
  canWrite,
  workspaceId,
}: FolderItemProps): JSX.Element {
  const isCollapsed = useFolderStore((s) => s.collapsedFolderIds.has(folder.folder_id))
  const toggleCollapsed = useFolderStore((s) => s.toggleCollapsed)
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(folder.name)
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const folderProjects = projects.filter((p) => p.folder_id === folder.folder_id)
  const childFolders = allFolders
    .filter((f) => f.parent_folder_id === folder.folder_id)
    .sort((a, b) => a.sort_order - b.sort_order)

  async function handleRename(): Promise<void> {
    if (!workspaceId || !renameName.trim()) return
    try {
      await folderService.updateFolder(workspaceId, folder.folder_id, {
        name: renameName.trim(),
      })
    } catch {
      // Reset on error
      setRenameName(folder.name)
    }
    setIsRenaming(false)
  }

  async function handleDelete(): Promise<void> {
    if (!workspaceId) return
    const confirmed = window.confirm(
      `Delete folder "${folder.name}"? Projects inside will be moved to the root level.`,
    )
    if (!confirmed) return
    try {
      await folderService.deleteFolder(workspaceId, folder.folder_id)
    } catch {
      // Silently handle error
    }
    setShowMenu(false)
  }

  async function handleMoveProjectToFolder(
    projectId: string,
    targetFolderId: string | null,
  ): Promise<void> {
    if (!workspaceId) return
    try {
      await projectService.updateProject(workspaceId, projectId, {
        folder_id: targetFolderId,
      })
    } catch {
      // Silently handle error
    }
    setShowMoveMenu(false)
  }

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <button
          onClick={() => toggleCollapsed(folder.folder_id)}
          className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />

        {isRenaming ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setIsRenaming(false)
                  setRenameName(folder.name)
                }
              }}
              autoFocus
              maxLength={FIELD_LIMITS.TITLE_MAX}
              className="min-w-0 flex-1 rounded border border-input bg-background px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleRename}
              className="p-0.5 text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setIsRenaming(false)
                setRenameName(folder.name)
              }}
              className="p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <span className="flex-1 truncate text-xs font-medium text-foreground">
            {folder.name}
          </span>
        )}

        <span className="shrink-0 text-xs text-muted-foreground">
          {folderProjects.length}
        </span>

        {canWrite && !isRenaming && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="invisible shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground group-hover:visible"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-card p-1 shadow-lg">
                <button
                  onClick={() => {
                    setIsRenaming(true)
                    setRenameName(folder.name)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                >
                  <Pencil className="h-3 w-3" />
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div>
          {/* Child folders */}
          {childFolders.map((childFolder) => (
            <FolderItem
              key={childFolder.folder_id}
              folder={childFolder}
              projects={projects}
              allFolders={allFolders}
              depth={depth + 1}
              canWrite={canWrite}
              workspaceId={workspaceId}
            />
          ))}

          {/* Projects in this folder */}
          {folderProjects.map((project) => (
            <div
              key={project.project_id}
              className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              style={{ paddingLeft: `${(depth + 1) * 12 + 20}px` }}
            >
              <Link
                to={`/projects/${project.project_id}`}
                className="min-w-0 flex-1 truncate text-xs text-foreground hover:text-primary"
              >
                {project.name}
              </Link>
              {canWrite && (
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(showMoveMenu === false ? true : false)}
                    className="invisible shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground group-hover:visible"
                    title="Move to folder"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                  </button>
                  {showMoveMenu && (
                    <MoveToFolderMenu
                      currentFolderId={folder.folder_id}
                      allFolders={allFolders}
                      onSelect={(folderId) =>
                        handleMoveProjectToFolder(project.project_id, folderId)
                      }
                      onClose={() => setShowMoveMenu(false)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          {folderProjects.length === 0 && childFolders.length === 0 && (
            <p
              className="px-2 py-1 text-xs italic text-muted-foreground"
              style={{ paddingLeft: `${(depth + 1) * 12 + 20}px` }}
            >
              Empty folder
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface MoveToFolderMenuProps {
  currentFolderId: string | null
  allFolders: Folder[]
  onSelect: (folderId: string | null) => void
  onClose: () => void
}

function MoveToFolderMenu({
  currentFolderId,
  allFolders,
  onSelect,
  onClose,
}: MoveToFolderMenuProps): JSX.Element {
  const otherFolders = allFolders.filter((f) => f.folder_id !== currentFolderId)

  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-card p-1 shadow-lg">
      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Move to...</p>
      <button
        onClick={() => {
          onSelect(null)
          onClose()
        }}
        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent ${
          currentFolderId === null ? 'bg-accent' : ''
        }`}
      >
        No Folder
      </button>
      {otherFolders.map((folder) => (
        <button
          key={folder.folder_id}
          onClick={() => {
            onSelect(folder.folder_id)
            onClose()
          }}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
        >
          <FolderIcon className="h-3 w-3 text-muted-foreground" />
          <span className="truncate">{folder.name}</span>
        </button>
      ))}
      {otherFolders.length === 0 && currentFolderId !== null && (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">No other folders</p>
      )}
    </div>
  )
}

export function FolderSidebar({ projects, onCreateFolder }: FolderSidebarProps): JSX.Element {
  const { folders } = useFolders()
  const canWrite = useCanWrite()
  const workspaceId = useWorkspaceId()

  // Root-level folders (no parent)
  const rootFolders = folders
    .filter((f) => !f.parent_folder_id)
    .sort((a, b) => a.sort_order - b.sort_order)

  // Projects not in any folder
  const unfolderedProjects = projects.filter((p) => !p.folder_id)

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-foreground">Folders</h3>
        {canWrite && (
          <button
            onClick={onCreateFolder}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {rootFolders.map((folder) => (
          <FolderItem
            key={folder.folder_id}
            folder={folder}
            projects={projects}
            allFolders={folders}
            depth={0}
            canWrite={canWrite}
            workspaceId={workspaceId}
          />
        ))}

        {/* Unfoldered projects section */}
        {unfolderedProjects.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">No Folder</p>
            {unfolderedProjects.map((project) => (
              <UnfolderedProjectItem
                key={project.project_id}
                project={project}
                allFolders={folders}
                canWrite={canWrite}
                workspaceId={workspaceId}
              />
            ))}
          </div>
        )}

        {rootFolders.length === 0 && unfolderedProjects.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No folders yet
          </p>
        )}
      </div>
    </div>
  )
}

interface UnfolderedProjectItemProps {
  project: Project
  allFolders: Folder[]
  canWrite: boolean
  workspaceId: string | null
}

function UnfolderedProjectItem({
  project,
  allFolders,
  canWrite,
  workspaceId,
}: UnfolderedProjectItemProps): JSX.Element {
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  async function handleMoveToFolder(folderId: string | null): Promise<void> {
    if (!workspaceId) return
    try {
      await projectService.updateProject(workspaceId, project.project_id, {
        folder_id: folderId,
      })
    } catch {
      // Silently handle error
    }
    setShowMoveMenu(false)
  }

  return (
    <div className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent" style={{ paddingLeft: '20px' }}>
      <Link
        to={`/projects/${project.project_id}`}
        className="min-w-0 flex-1 truncate text-xs text-foreground hover:text-primary"
      >
        {project.name}
      </Link>
      {canWrite && allFolders.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="invisible shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground group-hover:visible"
            title="Move to folder"
          >
            <ArrowRightLeft className="h-3 w-3" />
          </button>
          {showMoveMenu && (
            <MoveToFolderMenu
              currentFolderId={null}
              allFolders={allFolders}
              onSelect={handleMoveToFolder}
              onClose={() => setShowMoveMenu(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
