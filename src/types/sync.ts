import type { Game } from './game'

/**
 * Papel do dispositivo na sessão compartilhada
 */
export type SyncRole = 'host' | 'viewer' | 'none'

/**
 * Status da conexão com o servidor
 */
export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * Estado da sincronização
 */
export interface SyncState {
  // Estado
  role: SyncRole
  status: SyncStatus
  code: string | null
  error: string | null
  viewerCount: number
  deviceId: string

  // Actions
  shareGame: (game: Game) => Promise<string | null>
  joinGame: (code: string) => Promise<Game | null>
  leaveGame: () => Promise<void>
  syncGameState: (game: Game) => Promise<void>
  setStatus: (status: SyncStatus) => void
  setError: (error: string | null) => void
  updateViewerCount: (count: number) => void
  reset: () => void
}

/**
 * Dados do jogo compartilhado retornado do Supabase
 */
export interface SharedGame {
  id: string
  code: string
  host_device_id: string
  game_data: Game
  viewer_count: number
  created_at: string
  updated_at: string
  status: 'active' | 'finished' | 'expired'
}
