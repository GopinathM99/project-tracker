import { useState, useRef } from 'react'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { exportService } from '@/services/export-service'
import { projectService } from '@/services/project-service'
import { taskService } from '@/services/task-service'
import type { Task } from '@shared/schemas'
import { X, Upload, FileText } from 'lucide-react'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  projectId?: string
}

interface ImportPreview {
  fileName: string
  format: 'json' | 'csv'
  projectCount: number
  taskCount: number
  rawData: string
}

export function ImportDialog({
  open,
  onClose,
  projectId,
}: ImportDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function handleClose(): void {
    setError(null)
    setSuccess(null)
    setPreview(null)
    setProgress(null)
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (!content) {
        setError('Failed to read file')
        return
      }

      try {
        const isJSON = file.name.endsWith('.json')
        const isCSV = file.name.endsWith('.csv')

        if (!isJSON && !isCSV) {
          setError('Unsupported file format. Please use .json or .csv files.')
          return
        }

        if (isJSON) {
          const parsed = exportService.parseImportJSON(content)
          setPreview({
            fileName: file.name,
            format: 'json',
            projectCount: parsed.projects.length,
            taskCount: parsed.tasks.length,
            rawData: content,
          })
        } else {
          const rows = exportService.parseImportCSV(content)
          setPreview({
            fileName: file.name,
            format: 'csv',
            projectCount: 0,
            taskCount: rows.length,
            rawData: content,
          })
        }
      } catch {
        setError('Failed to parse file. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  async function handleImport(): Promise<void> {
    if (!workspaceId || !preview) return

    setImporting(true)
    setError(null)
    setSuccess(null)

    try {
      if (preview.format === 'json') {
        const parsed = exportService.parseImportJSON(preview.rawData)
        const total = parsed.projects.length + parsed.tasks.length
        let done = 0
        setProgress({ done, total })

        // Import projects
        for (const project of parsed.projects) {
          await projectService.createProject(workspaceId, {
            name: project.name,
            description: project.description ?? '',
            status: project.status,
            start_date: project.start_date,
            target_end_date: project.target_end_date,
            folder_id: project.folder_id ?? null,
            tag_ids: project.tag_ids ?? [],
          })
          done++
          setProgress({ done, total })
        }

        // Import tasks
        for (const task of parsed.tasks) {
          const targetProjectId = projectId || task.project_id
          if (!targetProjectId) continue

          await taskService.createTask(workspaceId, {
            project_id: targetProjectId,
            title: task.title,
            description: task.description ?? '',
            status: task.status ?? 'Not Started',
            priority: task.priority ?? 'Medium',
            owner: task.owner ?? null,
            start_date: task.start_date,
            expected_completion_date: task.expected_completion_date,
            due_date: task.due_date ?? null,
            parent_task_id: null,
            recurrence_id: null,
            kanban_sort_order: null,
            tag_ids: task.tag_ids ?? [],
          })
          done++
          setProgress({ done, total })
        }

        setSuccess(
          `Imported ${parsed.projects.length} project${parsed.projects.length !== 1 ? 's' : ''} and ${parsed.tasks.length} task${parsed.tasks.length !== 1 ? 's' : ''}.`,
        )
      } else {
        // CSV import (tasks only)
        const rows = exportService.parseImportCSV(preview.rawData)
        const total = rows.length
        let done = 0
        setProgress({ done, total })

        for (const row of rows) {
          const targetProjectId = projectId || row.project_id
          if (!targetProjectId) continue

          const startDate = row.start_date || new Date().toISOString()
          const expectedCompletion =
            row.expected_completion_date || new Date().toISOString()

          await taskService.createTask(workspaceId, {
            project_id: targetProjectId,
            title: row.title || 'Untitled Task',
            description: row.description || '',
            status: (row.status as Task['status']) || 'Not Started',
            priority: (row.priority as Task['priority']) || 'Medium',
            owner: row.owner || null,
            start_date: startDate,
            expected_completion_date: expectedCompletion,
            due_date: row.due_date || null,
            parent_task_id: null,
            recurrence_id: null,
            kanban_sort_order: null,
            tag_ids: [],
          })
          done++
          setProgress({ done, total })
        }

        setSuccess(
          `Imported ${rows.length} task${rows.length !== 1 ? 's' : ''}.`,
        )
      }

      setPreview(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import data',
      )
    } finally {
      setImporting(false)
      setProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Import Data</h2>
          <button
            onClick={handleClose}
            className="rounded-md px-1 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* File Input */}
          {!preview && !success && (
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Select File
              </label>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-6 py-8 hover:border-primary/50 hover:bg-accent/50">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to select a file
                </span>
                <span className="text-xs text-muted-foreground">
                  Supports .json and .csv formats
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Preview */}
          {preview && !success && (
            <div className="rounded-md border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {preview.fileName}
                </span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                  {preview.format.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                {preview.projectCount > 0 && (
                  <p>
                    {preview.projectCount} project
                    {preview.projectCount !== 1 ? 's' : ''}
                  </p>
                )}
                <p>
                  {preview.taskCount} task
                  {preview.taskCount !== 1 ? 's' : ''}
                </p>
              </div>

              {progress && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Importing...</span>
                    <span>
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-accent">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {success ? 'Done' : 'Cancel'}
            </button>
            {preview && !success && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {importing ? 'Importing...' : 'Import'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
