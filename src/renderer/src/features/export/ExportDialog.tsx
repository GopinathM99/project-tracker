import { useState } from 'react'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { exportService } from '@/services/export-service'
import { X, Download } from 'lucide-react'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  projectId?: string
  projectName?: string
}

type ExportScope = 'project' | 'workspace'
type ExportFormat = 'json' | 'csv'

export function ExportDialog({
  open,
  onClose,
  projectId,
  projectName,
}: ExportDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [scope, setScope] = useState<ExportScope>(
    projectId ? 'project' : 'workspace',
  )
  const [format, setFormat] = useState<ExportFormat>('json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function handleClose(): void {
    setError(null)
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  async function handleExport(): Promise<void> {
    if (!workspaceId) {
      setError('No workspace selected')
      return
    }

    if (scope === 'project' && !projectId) {
      setError('No project selected for export')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let data: string
      let fileName: string

      if (scope === 'project' && projectId) {
        if (format === 'json') {
          const exportData = await exportService.exportProjectToJSON(
            workspaceId,
            projectId,
          )
          data = JSON.stringify(exportData, null, 2)
          fileName = `${projectName || 'project'}-export.json`
        } else {
          data = await exportService.exportProjectToCSV(
            workspaceId,
            projectId,
          )
          fileName = `${projectName || 'project'}-tasks.csv`
        }
      } else {
        const exportData =
          await exportService.exportWorkspaceToJSON(workspaceId)
        data = JSON.stringify(exportData, null, 2)
        fileName = `workspace-export.json`
        // CSV format is only for project scope; workspace always exports as JSON
      }

      // Try using Electron save dialog first, fall back to browser download
      if (window.electronAPI?.saveFileDialog && window.electronAPI?.writeFile) {
        const filePath = await window.electronAPI.saveFileDialog(fileName)
        if (filePath) {
          await window.electronAPI.writeFile(filePath, data)
        }
      } else {
        // Browser fallback: create a Blob and trigger download
        const mimeType =
          format === 'json' ? 'application/json' : 'text/csv'
        const blob = new Blob([data], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Export Data</h2>
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

        <div className="space-y-4">
          {/* Export Scope */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Export Scope
            </label>
            <select
              value={scope}
              onChange={(e) => {
                setScope(e.target.value as ExportScope)
                // Reset to JSON if switching to workspace (CSV not supported for workspace)
                if (e.target.value === 'workspace') {
                  setFormat('json')
                }
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {projectId && (
                <option value="project">
                  Current Project{projectName ? ` (${projectName})` : ''}
                </option>
              )}
              <option value="workspace">Entire Workspace</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="json">JSON</option>
              {scope === 'project' && (
                <option value="csv">CSV (Tasks only)</option>
              )}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {format === 'json'
                ? 'Exports projects and tasks as structured JSON.'
                : 'Exports tasks as a CSV spreadsheet.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {loading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
