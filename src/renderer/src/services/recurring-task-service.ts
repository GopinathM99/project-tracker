import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import { taskService } from './task-service'
import type { RecurringTaskDefinition, RecurringTaskDefinitionCreate } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore'
import { addDays, addWeeks, addMonths, setDate, getDay } from 'date-fns'

/**
 * Calculate the next generation date based on interval type and value.
 */
function calculateNextDate(
  current: Date,
  intervalType: RecurringTaskDefinition['interval_type'],
  intervalValue: number,
  daysOfWeek: number[] | null,
  dayOfMonth: number | null,
): Date {
  switch (intervalType) {
    case 'Daily':
      return addDays(current, intervalValue)

    case 'Weekly': {
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find the next matching day of week
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b)
        const currentDow = getDay(current)
        // Look for the next day in the same week first
        const nextInWeek = sortedDays.find((d) => d > currentDow)
        if (nextInWeek !== undefined) {
          return addDays(current, nextInWeek - currentDow)
        }
        // Otherwise, go to the first day in the next interval
        const daysUntilNextWeek = 7 * intervalValue - currentDow + sortedDays[0]
        return addDays(current, daysUntilNextWeek)
      }
      return addWeeks(current, intervalValue)
    }

    case 'Monthly': {
      const nextMonth = addMonths(current, intervalValue)
      if (dayOfMonth !== null) {
        // Set to the specified day, clamping to month end
        const maxDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
        return setDate(nextMonth, Math.min(dayOfMonth, maxDay))
      }
      return nextMonth
    }

    case 'Custom':
      return addDays(current, intervalValue)

    default:
      return addDays(current, intervalValue)
  }
}

export const recurringTaskService = {
  async createRecurrence(
    workspaceId: string,
    data: Omit<RecurringTaskDefinitionCreate, 'workspace_id' | 'created_by'>,
  ): Promise<RecurringTaskDefinition> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a recurrence')
    }

    const recurrenceId = generateId()
    const now = generateTimestamp()

    const recurrence: RecurringTaskDefinition = {
      recurrence_id: recurrenceId,
      workspace_id: workspaceId,
      project_id: data.project_id,
      template_task_id: data.template_task_id,
      interval_type: data.interval_type,
      interval_value: data.interval_value,
      days_of_week: data.days_of_week ?? null,
      day_of_month: data.day_of_month ?? null,
      end_type: data.end_type,
      end_after_count: data.end_after_count ?? null,
      end_on_date: data.end_on_date ?? null,
      next_generation_date: data.next_generation_date,
      is_active: data.is_active ?? true,
      created_by: user.uid,
      created_at: now,
      updated_at: now,
    }

    const recRef = doc(db, 'workspaces', workspaceId, 'recurring_tasks', recurrenceId)
    await setDoc(recRef, recurrence)

    return recurrence
  },

  async getRecurrence(
    workspaceId: string,
    recurrenceId: string,
  ): Promise<RecurringTaskDefinition | null> {
    const recRef = doc(db, 'workspaces', workspaceId, 'recurring_tasks', recurrenceId)
    const snapshot = await getDoc(recRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as RecurringTaskDefinition
  },

  async getProjectRecurrences(
    workspaceId: string,
    projectId: string,
  ): Promise<RecurringTaskDefinition[]> {
    const recQuery = query(
      collection(db, 'workspaces', workspaceId, 'recurring_tasks'),
      where('project_id', '==', projectId),
    )

    const snapshots = await getDocs(recQuery)
    return snapshots.docs.map((d) => d.data() as RecurringTaskDefinition)
  },

  async updateRecurrence(
    workspaceId: string,
    recurrenceId: string,
    changes: Partial<
      Pick<
        RecurringTaskDefinition,
        | 'interval_type'
        | 'interval_value'
        | 'days_of_week'
        | 'day_of_month'
        | 'end_type'
        | 'end_after_count'
        | 'end_on_date'
        | 'next_generation_date'
        | 'is_active'
      >
    >,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a recurrence')
    }

    const recRef = doc(db, 'workspaces', workspaceId, 'recurring_tasks', recurrenceId)
    await updateDoc(recRef, {
      ...changes,
      updated_at: generateTimestamp(),
    })
  },

  async deleteRecurrence(
    workspaceId: string,
    recurrenceId: string,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a recurrence')
    }

    const recRef = doc(db, 'workspaces', workspaceId, 'recurring_tasks', recurrenceId)
    await deleteDoc(recRef)
  },

  async deactivateRecurrence(
    workspaceId: string,
    recurrenceId: string,
  ): Promise<void> {
    await this.updateRecurrence(workspaceId, recurrenceId, { is_active: false })
  },

  async generateNextInstance(
    workspaceId: string,
    recurrence: RecurringTaskDefinition,
  ): Promise<void> {
    // 1. Fetch template task
    const template = await taskService.getTask(workspaceId, recurrence.template_task_id)
    if (!template) {
      // Template was deleted; deactivate recurrence
      await this.deactivateRecurrence(workspaceId, recurrence.recurrence_id)
      return
    }

    // 2. Calculate duration from template
    const templateStart = new Date(template.start_date)
    const templateEnd = new Date(template.expected_completion_date)
    const durationMs = templateEnd.getTime() - templateStart.getTime()

    // 3. Calculate new task dates
    const newStartDate = new Date(recurrence.next_generation_date)
    const newExpectedCompletion = new Date(newStartDate.getTime() + durationMs)

    // 4. Create new task
    await taskService.createTask(workspaceId, {
      project_id: recurrence.project_id,
      title: template.title,
      description: template.description,
      priority: template.priority,
      owner: template.owner,
      status: 'Not Started',
      start_date: newStartDate.toISOString(),
      expected_completion_date: newExpectedCompletion.toISOString(),
      due_date: template.due_date ? newStartDate.toISOString() : null,
      parent_task_id: null,
      recurrence_id: recurrence.recurrence_id,
      kanban_sort_order: null,
      tag_ids: template.tag_ids,
    })

    // 5. Calculate next generation date
    const nextDate = calculateNextDate(
      newStartDate,
      recurrence.interval_type,
      recurrence.interval_value,
      recurrence.days_of_week,
      recurrence.day_of_month,
    )

    // 6. Check end conditions
    if (recurrence.end_type === 'AfterCount') {
      const remaining = (recurrence.end_after_count ?? 1) - 1
      if (remaining <= 0) {
        await this.updateRecurrence(workspaceId, recurrence.recurrence_id, {
          is_active: false,
          end_after_count: 0,
          next_generation_date: nextDate.toISOString(),
        })
        return
      }
      await this.updateRecurrence(workspaceId, recurrence.recurrence_id, {
        end_after_count: remaining,
        next_generation_date: nextDate.toISOString(),
      })
      return
    }

    if (recurrence.end_type === 'OnDate' && recurrence.end_on_date) {
      if (nextDate >= new Date(recurrence.end_on_date)) {
        await this.updateRecurrence(workspaceId, recurrence.recurrence_id, {
          is_active: false,
          next_generation_date: nextDate.toISOString(),
        })
        return
      }
    }

    // 7. Update next_generation_date
    await this.updateRecurrence(workspaceId, recurrence.recurrence_id, {
      next_generation_date: nextDate.toISOString(),
    })
  },

  async checkAndGenerateDue(workspaceId: string): Promise<void> {
    const now = new Date().toISOString()

    const dueQuery = query(
      collection(db, 'workspaces', workspaceId, 'recurring_tasks'),
      where('is_active', '==', true),
      where('next_generation_date', '<=', now),
    )

    const snapshots = await getDocs(dueQuery)
    const recurrences = snapshots.docs.map((d) => d.data() as RecurringTaskDefinition)

    for (const recurrence of recurrences) {
      await this.generateNextInstance(workspaceId, recurrence)
    }
  },
}
