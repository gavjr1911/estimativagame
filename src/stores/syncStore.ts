import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { SyncRole, SyncStatus } from '../types'
import type { Game } from '../types'
import { getDeviceId, generateShareCode, normalizeCode } from '../utils'

// Debounce para evitar muitas atualizações
let syncTimeout: ReturnType<typeof setTimeout> | null = null
const SYNC_DEBOUNCE_MS = 500

interface SyncStoreState {
  role: SyncRole
  status: SyncStatus
  code: string | null
  error: string | null
  viewerCount: number
  deviceId: string
}

interface SyncStoreActions {
  shareGame: (game: Game) => Promise<string | null>
  joinGame: (code: string) => Promise<Game | null>
  leaveGame: () => Promise<void>
  syncGameState: (game: Game) => Promise<void>
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

        set({ ...initialState, deviceId: get().deviceId })
      },

      /**
       * Sincroniza o estado do jogo (apenas host)
       */
      syncGameState: async (game: Game): Promise<void> => {
        const { role, code, status } = get()

        if (!isSupabaseConfigured || !supabase) return
        if (role !== 'host' || !code) return
        if (status !== 'connected') return

        // Debounce para evitar muitas atualizações
        if (syncTimeout) {
          clearTimeout(syncTimeout)
        }

        syncTimeout = setTimeout(async () => {
          if (!supabase) return

          try {
            const { error: updateError } = await supabase
              .from('shared_games')
              .update({
                game_data: game,
                status: game.status === 'finished' ? 'finished' : 'active',
              })
              .eq('code', code)

            if (updateError) {
              console.error('Error syncing game:', updateError)
            }
          } catch (err) {
            console.error('Error syncing game:', err)
          }
        }, SYNC_DEBOUNCE_MS)
      },

      setStatus: (status: SyncStatus) => set({ status }),

      setError: (error: string | null) => set({ error }),

      updateViewerCount: (viewerCount: number) => set({ viewerCount }),

      reset: () => set({ ...initialState, deviceId: get().deviceId }),
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
