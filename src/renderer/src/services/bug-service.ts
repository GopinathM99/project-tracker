import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import { activityLogger } from '@/services/activity-logger'
import type { Bug, BugCreate } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

export const bugService = {
  async createBug(
    workspaceId: string,
    data: Omit<BugCreate, 'workspace_id'>,
  ): Promise<Bug> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a bug')
    }

    const bugId = generateId()
    const now = generateTimestamp()

    const bug: Bug = {
      bug_id: bugId,
      workspace_id: workspaceId,
      project_id: data.project_id,
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'New',
      severity: data.severity ?? 'Medium',
      priority: data.priority ?? 'Medium',
      reporter: data.reporter ?? user.uid,
      assignee: data.assignee ?? null,
      environment: data.environment ?? '',
      steps_to_reproduce: data.steps_to_reproduce ?? '',
      expected_result: data.expected_result ?? '',
      actual_result: data.actual_result ?? '',
      reported_at: data.reported_at ?? now,
      target_fix_date: data.target_fix_date ?? null,
      resolved_at: null,
      tag_ids: data.tag_ids ?? [],
      deleted_at: null,
      created_at: now,
      updated_at: now,
    }

    const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
    await setDoc(bugRef, bug)

    void activityLogger.logBugCreated(workspaceId, bug).catch(() => {})

    return bug
  },

  async getBug(workspaceId: string, bugId: string): Promise<Bug | null> {
    const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
    const snapshot = await getDoc(bugRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as Bug
  },

  async getProjectBugs(workspaceId: string, projectId: string): Promise<Bug[]> {
    const bugsQuery = query(
      collection(db, 'workspaces', workspaceId, 'bugs'),
      where('project_id', '==', projectId),
      where('deleted_at', '==', null),
    )

    const snapshots = await getDocs(bugsQuery)
    return snapshots.docs.map((d) => d.data() as Bug)
  },

  async updateBug(
    workspaceId: string,
    bugId: string,
    changes: Partial<
      Pick<
        Bug,
        | 'title'
        | 'description'
        | 'status'
        | 'severity'
        | 'priority'
        | 'assignee'
        | 'environment'
        | 'steps_to_reproduce'
        | 'expected_result'
        | 'actual_result'
        | 'target_fix_date'
        | 'resolved_at'
        | 'tag_ids'
      >
    >,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a bug')
    }

    // Fetch current bug to detect changes for activity logging and resolved_at auto-set
    const currentBug = await this.getBug(workspaceId, bugId)

    const now = generateTimestamp()
    const updateData: Record<string, unknown> = {
      ...changes,
      updated_at: now,
    }

    // Auto-set resolved_at when status changes to Fixed, Verified, or Closed
    if (
      changes.status &&
      ['Fixed', 'Verified', 'Closed'].includes(changes.status) &&
      !changes.resolved_at
    ) {
      if (currentBug && !currentBug.resolved_at) {
        updateData.resolved_at = now
      }
    }

    const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
    await updateDoc(bugRef, updateData)

    // Fire-and-forget activity logging
    if (currentBug) {
      const updatedBug = { ...currentBug, ...changes }
      if (changes.status && changes.status !== currentBug.status) {
        void activityLogger
          .logBugStatusChanged(workspaceId, updatedBug, currentBug.status, changes.status)
          .catch(() => {})
      } else if (changes.assignee !== undefined && changes.assignee !== currentBug.assignee && changes.assignee) {
        void activityLogger
          .logBugAssigned(workspaceId, updatedBug, changes.assignee)
          .catch(() => {})
      } else {
        const changeDescriptions: string[] = []
        if (changes.title) changeDescriptions.push('title')
        if (changes.description !== undefined) changeDescriptions.push('description')
        if (changes.priority) changeDescriptions.push('priority')
        if (changes.severity) changeDescriptions.push('severity')
        if (changes.target_fix_date !== undefined) changeDescriptions.push('target fix date')
        const desc = changeDescriptions.length > 0 ? changeDescriptions.join(', ') : 'details'
        void activityLogger
          .logBugUpdated(workspaceId, updatedBug, desc)
          .catch(() => {})
      }
    }
  },

  async deleteBug(workspaceId: string, bugId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a bug')
    }

    // Fetch bug before deletion for the activity log
    const bug = await this.getBug(workspaceId, bugId)

    const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
    await updateDoc(bugRef, {
      deleted_at: generateTimestamp(),
      updated_at: generateTimestamp(),
    })

    if (bug) {
      void activityLogger
        .logBugDeleted(workspaceId, { bug_id: bugId, title: bug.title, project_id: bug.project_id })
        .catch(() => {})
    }
  },

  async restoreBug(workspaceId: string, bugId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to restore a bug')
    }

    // Fetch bug before restoring for the activity log
    const bug = await this.getBug(workspaceId, bugId)

    const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
    await updateDoc(bugRef, {
      deleted_at: null,
      updated_at: generateTimestamp(),
    })

    if (bug) {
      void activityLogger
        .logBugRestored(workspaceId, { bug_id: bugId, title: bug.title, project_id: bug.project_id })
        .catch(() => {})
    }
  },

  subscribeToProjectBugs(
    workspaceId: string,
    projectId: string,
    callback: (bugs: Bug[]) => void,
  ): Unsubscribe {
    const bugsQuery = query(
      collection(db, 'workspaces', workspaceId, 'bugs'),
      where('project_id', '==', projectId),
      where('deleted_at', '==', null),
    )

    return onSnapshot(bugsQuery, (snapshot) => {
      const bugs = snapshot.docs.map((d) => d.data() as Bug)
      callback(bugs)
    })
  },
}

// --- Client-side filtering and sorting utilities (FR-086) ---

export type BugSortField = 'title' | 'status' | 'severity' | 'priority' | 'reported_at' | 'target_fix_date' | 'created_at'
export type SortOrder = 'asc' | 'desc'

export interface BugFilters {
  status?: string[]
  severity?: string[]
  priority?: string[]
  assignee?: string | null
  search?: string
}

const PRIORITY_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
const SEVERITY_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
const BUG_STATUS_ORDER: Record<string, number> = {
  New: 1,
  Triaged: 2,
  'In Progress': 3,
  Fixed: 4,
  Verified: 5,
  Closed: 6,
  Reopened: 7,
}

export function filterBugs(bugs: Bug[], filters: BugFilters): Bug[] {
  return bugs.filter((bug) => {
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(bug.status)) return false
    }

    if (filters.severity && filters.severity.length > 0) {
      if (!filters.severity.includes(bug.severity)) return false
    }

    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(bug.priority)) return false
    }

    if (filters.assignee !== undefined) {
      if (filters.assignee === null) {
        if (bug.assignee !== null) return false
      } else {
        if (bug.assignee !== filters.assignee) return false
      }
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      if (!bug.title.toLowerCase().includes(term)) return false
    }

    return true
  })
}

export function sortBugs(bugs: Bug[], field: BugSortField, order: SortOrder): Bug[] {
  const sorted = [...bugs].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'status':
        comparison = (BUG_STATUS_ORDER[a.status] ?? 0) - (BUG_STATUS_ORDER[b.status] ?? 0)
        break
      case 'severity':
        comparison = (SEVERITY_ORDER[a.severity] ?? 0) - (SEVERITY_ORDER[b.severity] ?? 0)
        break
      case 'priority':
        comparison = (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0)
        break
      case 'reported_at':
        comparison = a.reported_at.localeCompare(b.reported_at)
        break
      case 'target_fix_date': {
        if (a.target_fix_date === null && b.target_fix_date === null) comparison = 0
        else if (a.target_fix_date === null) comparison = 1
        else if (b.target_fix_date === null) comparison = -1
        else comparison = a.target_fix_date.localeCompare(b.target_fix_date)
        break
      }
      case 'created_at':
        comparison = a.created_at.localeCompare(b.created_at)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}
