import { describe, it, expect } from 'vitest'
import { workspaceSchema, workspaceCreateSchema } from '@shared/schemas/workspace'

describe('workspaceSchema', () => {
  const validWorkspace = {
    workspace_id: 'ws-1',
    name: 'My Workspace',
    slug: 'my-workspace',
    owner_user_id: 'user-1',
    plan_tier: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }

  it('accepts valid workspace', () => {
    const result = workspaceSchema.safeParse(validWorkspace)
    expect(result.success).toBe(true)
  })

  it('rejects workspace without name', () => {
    const result = workspaceSchema.safeParse({ ...validWorkspace, name: '' })
    expect(result.success).toBe(false)
  })

  it('accepts optional plan_tier', () => {
    const result = workspaceSchema.safeParse({ ...validWorkspace, plan_tier: 'Pro' })
    expect(result.success).toBe(true)
  })
})

describe('workspaceCreateSchema', () => {
  it('omits auto-generated fields', () => {
    const result = workspaceCreateSchema.safeParse({
      name: 'New Workspace',
      slug: 'new-workspace',
      owner_user_id: 'user-1',
      plan_tier: null,
    })
    expect(result.success).toBe(true)
  })
})
