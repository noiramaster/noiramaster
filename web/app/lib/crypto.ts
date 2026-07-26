import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = process.env.ENCRYPTION_KEY || ''

function getKey(): Buffer {
  if (!KEY) throw new Error('ENCRYPTION_KEY env var not set')
  // Accept 32-byte hex or base64 key, or derive from any string
  if (KEY.length === 64) return Buffer.from(KEY, 'hex')
  if (KEY.length === 44) return Buffer.from(KEY, 'base64')
  return crypto.scryptSync(KEY, 'noira-salt', 32)
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const key = getKey()
  const [ivHex, authTagHex, data] = encryptedText.split(':')
  if (!ivHex || !authTagHex || !data) throw new Error('Invalid encrypted format')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
