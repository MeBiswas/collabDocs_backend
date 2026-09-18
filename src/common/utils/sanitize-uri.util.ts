/**
 * Strips username and password from database connection strings
 * Example input:  mongodb+srv://app_user:secret_pass@cluster0.abc.mongodb.net/collabdocs
 * Example output: mongodb+srv://cluster0.abc.mongodb.net/collabdocs
 */
export function sanitizeMongoURI(uri: string): string {
  try {
    const parsed = new URL(uri)
    parsed.username = ''
    parsed.password = ''
    return parsed.toString()
  } catch (error) {
    console.log('Sanitize URI Error:', error)
    return uri.replace(/\/\/[^@]+@/, '//')
  }
}
