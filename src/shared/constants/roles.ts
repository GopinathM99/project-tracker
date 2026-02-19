export const MEMBER_ROLES = ['Owner', 'Member', 'Viewer'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

export const PLAN_TIERS = ['Free', 'Pro'] as const
export type PlanTier = (typeof PLAN_TIERS)[number]
