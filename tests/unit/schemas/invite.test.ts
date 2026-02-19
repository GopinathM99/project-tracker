import { describe, it, expect } from 'vitest'
import { inviteSchema, inviteCreateSchema } from '@shared/schemas/invite'

describe('inviteSchema', () => {
  const validInvite = {
    invite_id: 'inv-123',
    workspace_id: 'ws-456',
    invited_email: 'user@example.com',
    role: 'Member' as const,
    status: 'Pending' as const,
    token_hash: 'abc123def456',
    expires_at: '2026-02-26T00:00:00.000Z',
    invited_by: 'user-789',
    accepted_by_user_id: null,
    accepted_at: null,
    revoked_at: null,
    created_at: '2026-02-19T00:00:00.000Z',
    updated_at: '2026-02-19T00:00:00.000Z',
  }

  it('validates a correct invite', () => {
    const result = inviteSchema.safeParse(validInvite)
    expect(result.success).toBe(true)
  })

  it('requires a valid email', () => {
    const result = inviteSchema.safeParse({
      ...validInvite,
      invited_email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid roles', () => {
    for (const role of ['Owner', 'Member', 'Viewer'] as const) {
      const result = inviteSchema.safeParse({ ...validInvite, role })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid roles', () => {
    const result = inviteSchema.safeParse({ ...validInvite, role: 'Admin' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid statuses', () => {
    for (const status of ['Pending', 'Accepted', 'Expired', 'Revoked'] as const) {
      const result = inviteSchema.safeParse({ ...validInvite, status })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid statuses', () => {
    const result = inviteSchema.safeParse({ ...validInvite, status: 'Cancelled' })
    expect(result.success).toBe(false)
  })

  it('requires invite_id', () => {
    const { invite_id, ...rest } = validInvite
    const result = inviteSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('requires token_hash', () => {
    const { token_hash, ...rest } = validInvite
    const result = inviteSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('allows null accepted_by_user_id', () => {
    const result = inviteSchema.safeParse({
      ...validInvite,
      accepted_by_user_id: null,
    })
    expect(result.success).toBe(true)
  })

  it('allows string accepted_by_user_id', () => {
    const result = inviteSchema.safeParse({
      ...validInvite,
      accepted_by_user_id: 'user-abc',
    })
    expect(result.success).toBe(true)
  })

  it('requires datetime format for expires_at', () => {
    const result = inviteSchema.safeParse({
      ...validInvite,
      expires_at: 'not-a-date',
    })
    expect(result.success).toBe(false)
  })
})

describe('inviteCreateSchema', () => {
  it('omits auto-generated fields', () => {
    const validCreate = {
      workspace_id: 'ws-456',
      invited_email: 'user@example.com',
      role: 'Member' as const,
      status: 'Pending' as const,
      token_hash: 'abc123def456',
      expires_at: '2026-02-26T00:00:00.000Z',
      invited_by: 'user-789',
    }

    const result = inviteCreateSchema.safeParse(validCreate)
    expect(result.success).toBe(true)
  })

  it('defaults status to Pending', () => {
    const create = {
      workspace_id: 'ws-456',
      invited_email: 'user@example.com',
      role: 'Member' as const,
      token_hash: 'abc123def456',
      expires_at: '2026-02-26T00:00:00.000Z',
      invited_by: 'user-789',
    }

    const result = inviteCreateSchema.safeParse(create)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('Pending')
    }
  })
})
