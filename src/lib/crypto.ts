import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'promptforge-default-key-change-in-production'

export function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString()
}

export function decryptApiKey(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function generateId(): string {
  return CryptoJS.lib.WordArray.random(16).toString()
}