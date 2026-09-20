export function sanitizeRedisUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl)
    return `${parsed.hostname}:${parsed.port || '6379'}`
  } catch {
    return '[invalid-redis-url]'
  }
}
