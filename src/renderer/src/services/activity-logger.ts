import { auth } from '@/lib/auth'
import { activityEventService } from './activity-event-service'
import { inAppNotificationService } from './in-app-notification-service'
import type { Task, Bug, Project, Milestone } from '@shared/schemas'

export const activityLogger = {
  // --- Task events ---

  async logTaskCreated(workspaceId: string, task: Task): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Task',
      entity_id: task.task_id,
      action: 'Created',
      change_summary: `Created task "${task.title}"`,
      metadata: { project_id: task.project_id },
    })
  },

  async logTaskStatusChanged(
    workspaceId: string,
    task: Task,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Task',
      entity_id: task.task_id,
      action: 'StatusChanged',
      change_summary: `Changed task "${task.title}" status from ${oldStatus} to ${newStatus}`,
      metadata: { project_id: task.project_id, old_status: oldStatus, new_status: newStatus },
    })

    // Notify task owner if different from the actor
    const currentUserId = auth.currentUser?.uid
    if (task.owner && task.owner !== currentUserId) {
      await inAppNotificationService.createNotification(workspaceId, {
        recipient_user_id: task.owner,
        trigger_type: 'StatusChange',
        entity_type: 'Task',
        entity_id: task.task_id,
        title: 'Task Status Changed',
        body: `"${task.title}" moved from ${oldStatus} to ${newStatus}`,
      })
    }
  },

  async logTaskAssigned(
    workspaceId: string,
    task: Task,
    newOwner: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Task',
      entity_id: task.task_id,
      action: 'Assigned',
      change_summary: `Assigned task "${task.title}" to ${newOwner}`,
      metadata: { project_id: task.project_id, new_owner: newOwner },
    })

    // Notify the new owner if different from the actor
    const currentUserId = auth.currentUser?.uid
    if (newOwner !== currentUserId) {
      await inAppNotificationService.createNotification(workspaceId, {
        recipient_user_id: newOwner,
        trigger_type: 'Assignment',
        entity_type: 'Task',
        entity_id: task.task_id,
        title: 'Task Assigned to You',
        body: `You have been assigned to "${task.title}"`,
      })
    }
  },

  async logTaskUpdated(
    workspaceId: string,
    task: Task,
    changeDescription: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Task',
      entity_id: task.task_id,
      action: 'Updated',
      change_summary: `Updated task "${task.title}": ${changeDescription}`,
      metadata: { project_id: task.project_id },
    })
  },

  async logTaskDeleted(
    workspaceId: string,
    task: Pick<Task, 'task_id' | 'title' | 'project_id'>,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Task',
      entity_id: task.task_id,
      action: 'Deleted',
      change_summary: `Deleted task "${task.title}"`,
      metadata: { project_id: task.project_id },
    })
  },

  async logTaskRestored(
    workspaceId: string,
    task: Pick<Task, 'task_id' | 'title' | 'project_id'>,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Task',
      entity_id: task.task_id,
      action: 'Restored',
      change_summary: `Restored task "${task.title}"`,
      metadata: { project_id: task.project_id },
    })
  },

  // --- Bug events ---

  async logBugCreated(workspaceId: string, bug: Bug): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Bug',
      entity_id: bug.bug_id,
      action: 'Created',
      change_summary: `Created bug "${bug.title}"`,
      metadata: { project_id: bug.project_id },
    })
  },

  async logBugStatusChanged(
    workspaceId: string,
    bug: Bug,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Bug',
      entity_id: bug.bug_id,
      action: 'StatusChanged',
      change_summary: `Changed bug "${bug.title}" status from ${oldStatus} to ${newStatus}`,
      metadata: { project_id: bug.project_id, old_status: oldStatus, new_status: newStatus },
    })

    // Notify assignee if different from the actor
    const currentUserId = auth.currentUser?.uid
    if (bug.assignee && bug.assignee !== currentUserId) {
      await inAppNotificationService.createNotification(workspaceId, {
        recipient_user_id: bug.assignee,
        trigger_type: 'StatusChange',
        entity_type: 'Bug',
        entity_id: bug.bug_id,
        title: 'Bug Status Changed',
        body: `"${bug.title}" moved from ${oldStatus} to ${newStatus}`,
      })
    }
  },

  async logBugAssigned(
    workspaceId: string,
    bug: Bug,
    newAssignee: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Bug',
      entity_id: bug.bug_id,
      action: 'Assigned',
      change_summary: `Assigned bug "${bug.title}" to ${newAssignee}`,
      metadata: { project_id: bug.project_id, new_assignee: newAssignee },
    })

    // Notify the new assignee if different from the actor
    const currentUserId = auth.currentUser?.uid
    if (newAssignee !== currentUserId) {
      await inAppNotificationService.createNotification(workspaceId, {
        recipient_user_id: newAssignee,
        trigger_type: 'Assignment',
        entity_type: 'Bug',
        entity_id: bug.bug_id,
        title: 'Bug Assigned to You',
        body: `You have been assigned to bug "${bug.title}"`,
      })
    }
  },

  async logBugUpdated(
    workspaceId: string,
    bug: Bug,
    changeDescription: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Bug',
      entity_id: bug.bug_id,
      action: 'Updated',
      change_summary: `Updated bug "${bug.title}": ${changeDescription}`,
      metadata: { project_id: bug.project_id },
    })
  },

  async logBugDeleted(
    workspaceId: string,
    bug: Pick<Bug, 'bug_id' | 'title' | 'project_id'>,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Bug',
      entity_id: bug.bug_id,
      action: 'Deleted',
      change_summary: `Deleted bug "${bug.title}"`,
      metadata: { project_id: bug.project_id },
    })
  },

  async logBugRestored(
    workspaceId: string,
    bug: Pick<Bug, 'bug_id' | 'title' | 'project_id'>,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Bug',
      entity_id: bug.bug_id,
      action: 'Restored',
      change_summary: `Restored bug "${bug.title}"`,
      metadata: { project_id: bug.project_id },
    })
  },

  // --- Project events ---

  async logProjectCreated(workspaceId: string, project: Project): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Project',
      entity_id: project.project_id,
      action: 'Created',
      change_summary: `Created project "${project.name}"`,
    })
  },

  async logProjectUpdated(
    workspaceId: string,
    project: Project,
    changeDescription: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Project',
      entity_id: project.project_id,
      action: 'Updated',
      change_summary: `Updated project "${project.name}": ${changeDescription}`,
    })
  },

  async logProjectArchived(workspaceId: string, project: Project): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Project',
      entity_id: project.project_id,
      action: 'Archived',
      change_summary: `Archived project "${project.name}"`,
    })
  },

  async logProjectUnarchived(workspaceId: string, project: Project): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Project',
      entity_id: project.project_id,
      action: 'Unarchived',
      change_summary: `Unarchived project "${project.name}"`,
    })
  },

  async logProjectDeleted(
    workspaceId: string,
    project: Pick<Project, 'project_id' | 'name'>,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Project',
      entity_id: project.project_id,
      action: 'Deleted',
      change_summary: `Deleted project "${project.name}"`,
    })
  },

  // --- Comment events ---

  async logCommentAdded(
    workspaceId: string,
    entityType: 'Task' | 'Bug' | 'Project',
    entityId: string,
    entityTitle: string,
    comment: { comment_id: string; content_markdown: string },
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Comment',
      entity_id: comment.comment_id,
      action: 'Commented',
      change_summary: `Commented on ${entityType.toLowerCase()} "${entityTitle}"`,
      metadata: { parent_entity_type: entityType, parent_entity_id: entityId },
    })
  },

  // --- Milestone events ---

  async logMilestoneCreated(workspaceId: string, milestone: Milestone): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Milestone',
      entity_id: milestone.milestone_id,
      action: 'Created',
      change_summary: `Created milestone "${milestone.title}"`,
      metadata: { project_id: milestone.project_id },
    })
  },

  async logMilestoneUpdated(
    workspaceId: string,
    milestone: Milestone,
    changeDescription: string,
  ): Promise<void> {
    await activityEventService.logEvent(workspaceId, {
      entity_type: 'Milestone',
      entity_id: milestone.milestone_id,
      action: 'Updated',
      change_summary: `Updated milestone "${milestone.title}": ${changeDescription}`,
      metadata: { project_id: milestone.project_id },
    })
  },
}
