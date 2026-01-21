import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { SyncRole, SyncStatus } from '../types'
import type { Game } from '../types'
import { getDeviceId, generateShareCode, normalizeCode } from '../utils'

// Configurações de sincronização
const SYNC_DEBOUNCE_MS = 300
const SYNC_RETRY_DELAY_MS = 1000
const MAX_SYNC_RETRIES = 5

// Estado da fila de sincronização
let syncTimeout: ReturnType<typeof setTimeout> | null = null
let retryTimeout: ReturnType<typeof setTimeout> | null = null
let pendingGameState: Game | null = null
let retryCount = 0
let isSyncing = false

// Função auxiliar para agendar retry com backoff exponencial
function scheduleRetry(fn: () => void) {
  if (retryTimeout) {
    clearTimeout(retryTimeout)
  }
  const delay = SYNC_RETRY_DELAY_MS * Math.pow(1.5, Math.min(retryCount, 5))
  console.log(`[Sync] Retry scheduled in ${delay}ms`)
  retryTimeout = setTimeout(fn, delay)
}

// Função para limpar timers de sync
function clearSyncTimers() {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
    syncTimeout = null
  }
  if (retryTimeout) {
    clearTimeout(retryTimeout)
    retryTimeout = null
  }
  pendingGameState = null
  retryCount = 0
  isSyncing = false
}

interface SyncStoreState {
  role: SyncRole
  status: SyncStatus
  code: string | null
  error: string | null
  viewerCount: number
  deviceId: string
  lastSyncedAt: number | null
  hasPendingChanges: boolean
}

interface SyncStoreActions {
  shareGame: (game: Game) => Promise<string | null>
  joinGame: (code: string) => Promise<Game | null>
  leaveGame: () => Promise<void>
  syncGameState: (game: Game) => Promise<void>
  flushPendingSync: () => Promise<void>
  setStatus: (status: SyncStatus) => void
  setError: (error: string | null) => void
  updateViewerCount: (count: number) => void
  reset: () => void
}

type SyncStore = SyncStoreState & SyncStoreActions

const initialState: SyncStoreState = {
  role: 'none',
  status: 'disconnected',
  code: null,
  error: null,
  viewerCount: 0,
  deviceId: '',
  lastSyncedAt: null,
  hasPendingChanges: false,
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      deviceId: typeof window !== 'undefined' ? getDeviceId() : '',

      /**
       * Compartilha o jogo atual e retorna o código
       */
      shareGame: async (game: Game): Promise<string | null> => {
        if (!isSupabaseConfigured || !supabase) {
          set({ error: 'Sincronização não configurada' })
          return null
        }

        set({ status: 'connecting', error: null })

        try {
          const deviceId = get().deviceId || getDeviceId()
          let code = generateShareCode()
          let attempts = 0
          const maxAttempts = 5

          // Tentar gerar código único
          while (attempts < maxAttempts) {
            const { data: existing } = await supabase
              .from('shared_games')
              .select('code')
              .eq('code', code)
              .eq('status', 'active')
              .single()

            if (!existing) break

            code = generateShareCode()
            attempts++
          }

          if (attempts >= maxAttempts) {
            set({ status: 'error', error: 'Não foi possível gerar código único' })
            return null
          }

          // Inserir novo jogo compartilhado
          const { error: insertError } = await supabase
            .from('shared_games')
            .insert({
              code,
              host_device_id: deviceId,
              game_data: game,
              status: 'active',
            })

          if (insertError) {
            console.error('Error sharing game:', insertError)
            set({ status: 'error', error: 'Erro ao compartilhar jogo' })
            return null
          }

          set({
            role: 'host',
            status: 'connected',
            code,
            deviceId,
            error: null,
          })

          return code
        } catch (err) {
          console.error('Error sharing game:', err)
          set({ status: 'error', error: 'Erro de conexão' })
          return null
        }
      },

      /**
       * Entra em um jogo compartilhado pelo código
       */
      joinGame: async (inputCode: string): Promise<Game | null> => {
        if (!isSupabaseConfigured || !supabase) {
          set({ error: 'Sincronização não configurada' })
          return null
        }

        const code = normalizeCode(inputCode)
        if (code.length !== 6) {
          set({ error: 'Código inválido' })
          return null
        }

        set({ status: 'connecting', error: null })

        try {
          const { data, error: fetchError } = await supabase
            .from('shared_games')
            .select('*')
            .eq('code', code)
            .eq('status', 'active')
            .single()

          if (fetchError || !data) {
            set({ status: 'error', error: 'Jogo não encontrado' })
            return null
          }

          // Incrementar viewer count
          await supabase
            .from('shared_games')
            .update({ viewer_count: (data.viewer_count || 0) + 1 })
            .eq('id', data.id)

          set({
            role: 'viewer',
            status: 'connected',
            code,
            viewerCount: (data.viewer_count || 0) + 1,
            error: null,
          })

          return data.game_data as Game
        } catch (err) {
          console.error('Error joining game:', err)
          set({ status: 'error', error: 'Erro de conexão' })
          return null
        }
      },

      /**
       * Sai do jogo compartilhado
       */
      leaveGame: async (): Promise<void> => {
        const { role, code } = get()

        if (!isSupabaseConfigured || !supabase || !code) {
          set(initialState)
          return
        }

        try {
          if (role === 'host') {
            // Host: marcar como finalizado
            await supabase
              .from('shared_games')
              .update({ status: 'finished' })
              .eq('code', code)
          } else if (role === 'viewer') {
            // Viewer: decrementar contador
            const { data } = await supabase
              .from('shared_games')
              .select('viewer_count')
              .eq('code', code)
              .single()

            if (data) {
              await supabase
                .from('shared_games')
                .update({ viewer_count: Math.max(0, (data.viewer_count || 1) - 1) })
                .eq('code', code)
            }
          }
        } catch (err) {
          console.error('Error leaving game:', err)
        }

        clearSyncTimers()
        set({ ...initialState, deviceId: get().deviceId })
      },

      /**
       * Sincroniza o estado do jogo (apenas host)
       * Implementa fila de pendentes e retry automático
       */
      syncGameState: async (game: Game): Promise<void> => {
        const { role, code } = get()

        if (!isSupabaseConfigured || !supabase) return
        if (role !== 'host' || !code) return

        // Sempre armazena o estado mais recente
        pendingGameState = game
        set({ hasPendingChanges: true })

        // Debounce para evitar muitas atualizações
        if (syncTimeout) {
          clearTimeout(syncTimeout)
        }

        syncTimeout = setTimeout(() => {
          get().flushPendingSync()
        }, SYNC_DEBOUNCE_MS)
      },

      /**
       * Envia as alterações pendentes para o servidor
       * Chamado após reconexão ou quando há pendências
       */
      flushPendingSync: async (): Promise<void> => {
        const { role, code, status } = get()

        if (!isSupabaseConfigured || !supabase) return
        if (role !== 'host' || !code) return
        if (!pendingGameState) return
        if (isSyncing) return

        // Se não está conectado, agenda retry
        if (status !== 'connected') {
          console.log('[Sync] Not connected, will retry when connection is restored')
          set({ hasPendingChanges: true })
          scheduleRetry(get().flushPendingSync)
          return
        }

        isSyncing = true
        const gameToSync = pendingGameState

        try {
          console.log('[Sync] Sending game state to server...')
          const { error: updateError } = await supabase
            .from('shared_games')
            .update({
              game_data: gameToSync,
              status: gameToSync.status === 'finished' ? 'finished' : 'active',
            })
            .eq('code', code)

          if (updateError) {
            throw updateError
          }

          console.log('[Sync] Game state synced successfully')

          // Se o estado mudou durante o sync, não limpa pendências
          if (pendingGameState === gameToSync) {
            pendingGameState = null
            set({ hasPendingChanges: false })
          }

          set({ lastSyncedAt: Date.now() })
          retryCount = 0

        } catch (err) {
          console.error('[Sync] Error syncing game:', err)
          retryCount++

          if (retryCount < MAX_SYNC_RETRIES) {
            console.log(`[Sync] Scheduling retry ${retryCount}/${MAX_SYNC_RETRIES}`)
            scheduleRetry(get().flushPendingSync)
          } else {
            console.error('[Sync] Max retries reached, giving up')
            set({ error: 'Falha ao sincronizar. Verifique sua conexão.' })
            retryCount = 0
          }
        } finally {
          isSyncing = false
        }
      },

      setStatus: (status: SyncStatus) => set({ status }),

      setError: (error: string | null) => set({ error }),

      updateViewerCount: (viewerCount: number) => set({ viewerCount }),

      reset: () => {
        clearSyncTimers()
        set({ ...initialState, deviceId: get().deviceId })
      },
    }),
    {
      name: 'estimativa-sync',
      partialize: (state) => ({
        deviceId: state.deviceId,
        // Não persistir role, status, code - sessão é temporária
      }),
    }
  )
)
