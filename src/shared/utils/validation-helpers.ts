import { FIELD_LIMITS } from '../constants/validation'

/**
 * Validation helper functions for cross-entity constraints.
 * Pure functions usable in both create and update flows.
 */

/**
 * FR-106: Validate project dates so target_end_date cannot be earlier than start_date.
 * Returns an error message string if invalid, null if valid.
 */
export function validateProjectDates(startDate: string, targetEndDate: string): string | null {
  if (!startDate || !targetEndDate) return null

  const start = startDate.split('T')[0]
  const end = targetEndDate.split('T')[0]

  if (end < start) {
    return 'Target end date must be on or after start date'
  }

  return null
}

/**
 * FR-107: Validate that task planned dates remain within parent project active range.
 * Returns a warning/error message string if out of range, null if valid.
 */
export function validateTaskDatesInProject(
  task: { start_date: string; expected_completion_date: string; due_date: string | null },
  project: { start_date: string; target_end_date: string },
): string | null {
  const projStart = project.start_date.split('T')[0]
  const projEnd = project.target_end_date.split('T')[0]
  const taskStart = task.start_date.split('T')[0]
  const taskExpected = task.expected_completion_date.split('T')[0]

  if (taskStart < projStart) {
    return `Task start date (${taskStart}) is before the project start date (${projStart})`
  }

  if (taskExpected > projEnd) {
    return `Task expected completion date (${taskExpected}) is after the project target end date (${projEnd})`
  }

  if (task.due_date) {
    const taskDue = task.due_date.split('T')[0]
    if (taskDue > projEnd) {
      return `Task due date (${taskDue}) is after the project target end date (${projEnd})`
    }
  }

  return null
}

/**
 * FR-107: Validate that bug planned dates remain within parent project active range.
 * Returns a warning/error message string if out of range, null if valid.
 */
export function validateBugDatesInProject(
  bug: { reported_at: string; target_fix_date: string | null },
  project: { start_date: string; target_end_date: string },
): string | null {
  const projStart = project.start_date.split('T')[0]
  const projEnd = project.target_end_date.split('T')[0]
  const bugReported = bug.reported_at.split('T')[0]

  if (bugReported < projStart) {
    return `Bug reported date (${bugReported}) is before the project start date (${projStart})`
  }

  if (bug.target_fix_date) {
    const fixDate = bug.target_fix_date.split('T')[0]
    if (fixDate > projEnd) {
      return `Bug target fix date (${fixDate}) is after the project target end date (${projEnd})`
    }
  }

  return null
}

/**
 * FR-108: Validate field length against centralized limits.
 * Returns an error message string if too long, null if valid.
 */
export function validateFieldLength(
  value: string,
  maxLength: number,
  fieldName: string,
): string | null {
  if (value.length > maxLength) {
    return `${fieldName} exceeds maximum length of ${maxLength} characters`
  }

  return null
}

/**
 * FR-109: Validate subtask nesting depth.
 * Walks up the parent chain to determine the current depth, then checks against maxDepth.
 * Returns an error message string if too deep, null if valid.
 */
export function validateSubtaskDepth(
  parentTask: { task_id: string; parent_task_id: string | null } | null,
  allTasks: Array<{ task_id: string; parent_task_id: string | null }>,
  maxDepth: number = FIELD_LIMITS.SUBTASK_DEPTH_MAX,
): string | null {
  if (!parentTask) return null

  // Walk up the parent chain from the proposed parent
  let depth = 1
  let current: { task_id: string; parent_task_id: string | null } | undefined = parentTask
  const taskMap = new Map(allTasks.map((t) => [t.task_id, t]))

  while (current?.parent_task_id) {
    depth++
    current = taskMap.get(current.parent_task_id)

    if (depth > maxDepth) {
      return `Maximum subtask nesting depth of ${maxDepth} levels exceeded`
    }
  }

  if (depth >= maxDepth) {
    return `Maximum subtask nesting depth of ${maxDepth} levels exceeded`
  }

  return null
}

/**
 * FR-109: Detect dependency cycles before save.
 * Uses BFS to check if adding a dependency from fromTaskId to toTaskId would create a cycle.
 * Returns true if a cycle would be created.
 */
export function detectDependencyCycle(
  fromTaskId: string,
  toTaskId: string,
  existingDeps: Array<{ from_task_id: string; to_task_id: string }>,
): boolean {
  // Build adjacency list: from_task_id -> to_task_id[]
  const adjacency = new Map<string, string[]>()
  for (const dep of existingDeps) {
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
 * Validate entity link count against limit.
 * Returns an error message string if at limit, null if valid.
 */
export function validateEntityLinkCount(
  currentCount: number,
  maxLinks: number = FIELD_LIMITS.ENTITY_LINKS_MAX,
): string | null {
  if (currentCount >= maxLinks) {
    return `Maximum of ${maxLinks} entity links per entity has been reached`
  }

  return null
}
