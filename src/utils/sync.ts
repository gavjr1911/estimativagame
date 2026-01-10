/**
 * Utilitários para sincronização multi-dispositivo
 */

const DEVICE_ID_KEY = 'estimativa-device-id'
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sem I, O, 0, 1 para evitar confusão

/**
 * Gera ou recupera o ID único do dispositivo
 * Persiste em localStorage para manter consistência
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  return deviceId
}

/**
 * Gera um código único de 6 caracteres para compartilhar
 * Usa caracteres que não se confundem facilmente (sem I, O, 0, 1)
 */
export function generateShareCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length))
  }
  return code
}

/**
 * Normaliza o código de entrada (maiúsculo, sem espaços)
 */
export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)
}

/**
 * Valida se o código tem formato correto
 */
export function isValidCode(code: string): boolean {
  const normalized = normalizeCode(code)
  return normalized.length === 6 && /^[A-Z0-9]+$/.test(normalized)
}

/**
 * Formata o código para exibição (XXX-XXX)
 */
export function formatCodeForDisplay(code: string): string {
  const normalized = normalizeCode(code)
  if (normalized.length !== 6) return code
  return `${normalized.substring(0, 3)}-${normalized.substring(3)}`
}
