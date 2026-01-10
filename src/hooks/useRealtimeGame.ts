import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSyncStore, useGameStore } from '../stores'
import type { Game } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Tipo de encerramento
export type EndReason = 'share_stopped' | 'game_interrupted' | null

/**
 * Hook para sincronização em tempo real do jogo
 * - Viewers recebem atualizações do host
 * - Reconecta automaticamente se perder conexão
 * - Notifica quando o jogo é encerrado pelo host
 */
export function useRealtimeGame() {
  const { code, role, status, setStatus, updateViewerCount, reset } = useSyncStore()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [endReason, setEndReason] = useState<EndReason>(null)

  // Resetar endReason quando mudar de código
  useEffect(() => {
    setEndReason(null)
  }, [code])

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

          // Se jogo foi finalizado pelo host, notificar viewers
          if (newData.status === 'finished' && role === 'viewer') {
            // Verificar se o jogo em si foi interrompido ou apenas o compartilhamento
            const gameWasInterrupted = newData.game_data?.status === 'finished' || !newData.game_data

            if (gameWasInterrupted) {
              setEndReason('game_interrupted')
            } else {
              setEndReason('share_stopped')
            }

            setStatus('disconnected')
            reset()
          }
        }
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          console.log('Realtime connected')
        } else if (subscribeStatus === 'CHANNEL_ERROR') {
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
  }, [code, role, status, setStatus, updateViewerCount, reset])

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

  // Função para limpar o estado de jogo encerrado
  const clearEndReason = useCallback(() => {
    setEndReason(null)
  }, [])

  return { reconnect, endReason, clearEndReason }
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
