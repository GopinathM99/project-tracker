/**
 * Privacy and data handling constants.
 * NFR-012: User data handling aligned with applicable privacy regulations.
 */
export const PRIVACY_CONFIG = {
  /** Fields that should never be logged or sent to monitoring services */
  SENSITIVE_FIELDS: ['password', 'token', 'invite_token_hash', 'email'] as const,
  /** Data retention: soft-deleted items are purged after this many days */
  SOFT_DELETE_RETENTION_DAYS: 30,
  /** User data is stored only in Firestore and local IndexedDB cache */
  STORAGE_LOCATIONS: ['firestore', 'indexeddb-cache'] as const,
} as const
