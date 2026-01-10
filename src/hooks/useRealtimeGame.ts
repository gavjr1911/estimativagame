import { useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSyncStore, useGameStore } from '../stores'
import type { Game } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook para sincronização em tempo real do jogo
 * - Viewers recebem atualizações do host
 * - Reconecta automaticamente se perder conexão
 */
export function useRealtimeGame() {
  const { code, role, status, setStatus, updateViewerCount } = useSyncStore()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Não fazer nada se não estiver conectado ou sem código
    if (!isSupabaseConfigured || !supabase || !code || status !== 'connected') {
      return
    }

    // Criar channel para escutar mudanças
    const channel = supabase
      .channel(`game:${code}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_games',
          filter: `code=eq.${code}`,
        },
        (payload) => {
          const newData = payload.new as {
            game_data: Game
            viewer_count: number
            status: string
          }

          // Atualizar viewer count para todos
          updateViewerCount(newData.viewer_count || 0)

          // Viewer recebe atualizações do host
          if (role === 'viewer' && newData.game_data) {
            useGameStore.setState({ game: newData.game_data })
          }

          // Se jogo foi finalizado pelo host, atualizar status
          if (newData.status === 'finished') {
            setStatus('disconnected')
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error')
          setStatus('error')
        }
      })

    channelRef.current = channel

    // Cleanup ao desmontar ou mudar código
    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [code, role, status, setStatus, updateViewerCount])

  // Função para forçar reconexão
  const reconnect = async () => {
    if (!code) return

    setStatus('connecting')

    // Remover channel antigo
    if (channelRef.current && supabase) {
      await supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // O useEffect vai recriar o channel
    setStatus('connected')
  }

  return { reconnect }
}

/**
 * Hook para verificar se o Supabase está configurado
 */
export function useSupabaseStatus() {
  return {
    isConfigured: isSupabaseConfigured,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }
}
