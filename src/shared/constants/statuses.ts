export const TASK_STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const BUG_STATUSES = [
  'New',
  'Triaged',
  'In Progress',
  'Fixed',
  'Verified',
  'Closed',
  'Reopened',
] as const
export type BugStatus = (typeof BUG_STATUSES)[number]

export const MILESTONE_STATUSES = ['Planned', 'In Progress', 'Completed', 'Delayed'] as const
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number]

export const PROJECT_STATUSES = ['Active', 'On Hold', 'Completed', 'Archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export type Priority = (typeof PRIORITIES)[number]

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export type Severity = (typeof SEVERITIES)[number]

export const INVITE_STATUSES = ['Pending', 'Accepted', 'Expired', 'Revoked'] as const
export type InviteStatus = (typeof INVITE_STATUSES)[number]

export const MEMBER_STATUSES = ['Active', 'Suspended', 'Removed'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

export const SYNC_STATUSES = ['offline', 'syncing', 'in-sync', 'sync-error'] as const
export type SyncStatus = (typeof SYNC_STATUSES)[number]

export const THEMES = ['System', 'Light', 'Dark'] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_VIEWS = ['Dashboard', 'Kanban', 'Calendar', 'TaskList'] as const
export type DefaultView = (typeof DEFAULT_VIEWS)[number]

export const TAG_SCOPES = ['Global', 'Project'] as const
export type TagScope = (typeof TAG_SCOPES)[number]

export const STORAGE_PROVIDERS = ['Local', 'FirebaseStorage'] as const
export type StorageProvider = (typeof STORAGE_PROVIDERS)[number]

export const DEPENDENCY_RELATION_TYPES = ['Finish-to-Start'] as const
export type DependencyRelationType = (typeof DEPENDENCY_RELATION_TYPES)[number]

export const ENTITY_TYPES = ['Task', 'Bug', 'Project', 'Comment', 'Milestone', 'Workspace'] as const
export type EntityType = (typeof ENTITY_TYPES)[number]

export const LINKABLE_ENTITY_TYPES = ['Task', 'Bug'] as const
export type LinkableEntityType = (typeof LINKABLE_ENTITY_TYPES)[number]

export const COMMENTABLE_ENTITY_TYPES = ['Task', 'Bug', 'Project'] as const
export type CommentableEntityType = (typeof COMMENTABLE_ENTITY_TYPES)[number]

export const ATTACHABLE_ENTITY_TYPES = ['Task', 'Bug', 'Project', 'Comment'] as const
export type AttachableEntityType = (typeof ATTACHABLE_ENTITY_TYPES)[number]

export const INTERVAL_TYPES = ['Daily', 'Weekly', 'Monthly', 'Custom'] as const
export type IntervalType = (typeof INTERVAL_TYPES)[number]

export const END_TYPES = ['Never', 'AfterCount', 'OnDate'] as const
export type EndType = (typeof END_TYPES)[number]

export const TRIGGER_TYPES = [
  'Reminder',
  'Overdue',
  'Assignment',
  'Comment',
  'Invite',
  'StatusChange',
  'PriorityChange',
] as const
export type TriggerType = (typeof TRIGGER_TYPES)[number]

export const ACTIVITY_ACTIONS = [
  'Created',
  'Updated',
  'Deleted',
  'Restored',
  'StatusChanged',
  'Assigned',
  'Commented',
  'Linked',
  'Unlinked',
  'Archived',
  'Unarchived',
] as const
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number]
