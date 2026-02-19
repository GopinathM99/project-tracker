import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { DependencyLink } from '@shared/schemas'
import type { Task } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

/**
 * Check if adding a dependency from `fromTaskId` to `toTaskId` would create a cycle.
 * Returns true if a cycle would be created (i.e., toTaskId can already reach fromTaskId).
 */
export function checkCircularDependency(
  dependencies: DependencyLink[],
  fromTaskId: string,
  toTaskId: string,
): boolean {
  // We want to add: fromTaskId -> toTaskId (meaning toTaskId depends on fromTaskId).
  // A cycle exists if toTaskId can already reach fromTaskId through existing dependencies.
  // In existing deps, from_task_id -> to_task_id means to_task_id depends on from_task_id.
  // So we need to check: can fromTaskId be reached starting from toTaskId by following
  // the chain of "from_task_id" for each "to_task_id"?
  // Actually: if toTaskId is a prerequisite (from_task_id) for something that eventually
  // leads to fromTaskId being a to_task_id, that's a cycle.
  //
  // Build adjacency: for each dep, from_task_id -> to_task_id.
  // Check if toTaskId can reach fromTaskId in this graph.
  // If yes, then adding fromTaskId -> toTaskId creates a cycle.

  const adjacency = new Map<string, string[]>()
  for (const dep of dependencies) {
    const existing = adjacency.get(dep.from_task_id) ?? []
    existing.push(dep.to_task_id)
    adjacency.set(dep.from_task_id, existing)
  }

  // BFS from toTaskId to see if we can reach fromTaskId
  const visited = new Set<string>()
  const queue = [toTaskId]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === fromTaskId) return true
    if (visited.has(current)) continue
    visited.add(current)

    const neighbors = adjacency.get(current) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor)
      }
    }
  }

  return false
}

/**
 * Check if a task is blocked by unmet dependencies.
 * Returns the list of blocking task IDs (tasks that are not Done yet).
 */
export function getBlockedStatus(
  task: Task,
  dependencies: DependencyLink[],
  allTasks: Task[],
): { isBlocked: boolean; blockedBy: string[] } {
  // Find all dependencies where this task is the dependent (to_task_id)
  const taskDeps = dependencies.filter((d) => d.to_task_id === task.task_id)

  if (taskDeps.length === 0) {
    return { isBlocked: false, blockedBy: [] }
  }

  const taskMap = new Map(allTasks.map((t) => [t.task_id, t]))
  const blockedBy: string[] = []

  for (const dep of taskDeps) {
    const prerequisite = taskMap.get(dep.from_task_id)
    if (prerequisite && prerequisite.status !== 'Done') {
      blockedBy.push(dep.from_task_id)
    }
  }

  return { isBlocked: blockedBy.length > 0, blockedBy }
}

export const dependencyService = {
  async createDependency(
    workspaceId: string,
    fromTaskId: string,
    toTaskId: string,
  ): Promise<DependencyLink> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a dependency')
    }

    const dependencyId = generateId()
    const now = generateTimestamp()

    const dependencyLink: DependencyLink = {
      dependency_id: dependencyId,
      workspace_id: workspaceId,
      from_task_id: fromTaskId,
      to_task_id: toTaskId,
      relation_type: 'Finish-to-Start',
      is_cross_project: false,
      created_by: user.uid,
      created_at: now,
      updated_at: now,
    }

    const depRef = doc(db, 'workspaces', workspaceId, 'dependencies', dependencyId)
    await setDoc(depRef, dependencyLink)

    return dependencyLink
  },

  async getDependenciesForTask(
    workspaceId: string,
    taskId: string,
  ): Promise<DependencyLink[]> {
    const depsQuery = query(
      collection(db, 'workspaces', workspaceId, 'dependencies'),
      where('to_task_id', '==', taskId),
    )

    const snapshots = await getDocs(depsQuery)
    return snapshots.docs.map((d) => d.data() as DependencyLink)
  },

  async getDependentsOfTask(
    workspaceId: string,
    taskId: string,
  ): Promise<DependencyLink[]> {
    const depsQuery = query(
      collection(db, 'workspaces', workspaceId, 'dependencies'),
      where('from_task_id', '==', taskId),
    )

    const snapshots = await getDocs(depsQuery)
    return snapshots.docs.map((d) => d.data() as DependencyLink)
  },

  async getWorkspaceDependencies(workspaceId: string): Promise<DependencyLink[]> {
    const depsCollection = collection(db, 'workspaces', workspaceId, 'dependencies')
    const snapshots = await getDocs(depsCollection)
    return snapshots.docs.map((d) => d.data() as DependencyLink)
  },

  async removeDependency(workspaceId: string, dependencyId: string): Promise<void> {
    const depRef = doc(db, 'workspaces', workspaceId, 'dependencies', dependencyId)
    await deleteDoc(depRef)
  },

  subscribeToWorkspaceDependencies(
    workspaceId: string,
    callback: (deps: DependencyLink[]) => void,
  ): Unsubscribe {
    const depsCollection = collection(db, 'workspaces', workspaceId, 'dependencies')

    return onSnapshot(depsCollection, (snapshot) => {
      const deps = snapshot.docs.map((d) => d.data() as DependencyLink)
      callback(deps)
    })
  },
}
