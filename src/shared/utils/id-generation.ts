export function generateId(): string {
  return crypto.randomUUID()
}

export function generateTimestamp(): string {
  return new Date().toISOString()
}
