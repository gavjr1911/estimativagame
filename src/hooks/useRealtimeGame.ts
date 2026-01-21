import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSyncStore, useGameStore } from '../stores'
import type { Game } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Tipo de encerramento
export type EndReason = 'share_stopped' | 'game_interrupted' | null

// Constantes de reconexão
const RECONNECT_DELAY_MS = 1500
const MAX_RECONNECT_ATTEMPTS = 15
const HEARTBEAT_INTERVAL_MS = 15000
const VISIBILITY_RECONNECT_DELAY_MS = 500

/**
 * Hook para sincronização em tempo real do jogo
 * - Viewers recebem atualizações do host
 * - Reconecta automaticamente se perder conexão
 * - Notifica quando o jogo é encerrado pelo host
 */
export function useRealtimeGame() {
  const { code, role, status, setStatus, updateViewerCount, reset } = useSyncStore()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isReconnectingRef = useRef(false)
  const [endReason, setEndReason] = useState<EndReason>(null)

  // Resetar endReason quando mudar de código
  useEffect(() => {
    setEndReason(null)
  }, [code])

  // Função para limpar recursos
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    isReconnectingRef.current = false
  }, [])

  // Função para criar e conectar o channel
  const createChannel = useCallback(() => {
    if (!isSupabaseConfigured || !supabase || !code || role === 'none') {
      return
    }

    // Limpar channel anterior se existir
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    console.log('[Realtime] Creating channel for code:', code)

    const channel = supabase
      .channel(`game:${code}`, {
        config: {
          presence: { key: code },
        },
      })
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
            const gameWasInterrupted =
              newData.game_data?.status === 'finished' || !newData.game_data

            if (gameWasInterrupted) {
              setEndReason('game_interrupted')
            } else {
              setEndReason('share_stopped')
            }

            cleanup()
            setStatus('disconnected')
            reset()
          }
        }
      )
      .subscribe((subscribeStatus, err) => {
        console.log('[Realtime] Subscribe status:', subscribeStatus, err)

        switch (subscribeStatus) {
          case 'SUBSCRIBED':
            console.log('[Realtime] Connected successfully')
            setStatus('connected')
            reconnectAttemptsRef.current = 0
            isReconnectingRef.current = false

            // Se for host, enviar pendências após reconexão
            if (role === 'host') {
              console.log('[Realtime] Host reconnected, flushing pending sync')
              // Pequeno delay para garantir que a conexão esteja estável
              setTimeout(() => {
                useSyncStore.getState().flushPendingSync()
              }, 200)
            }
            break

          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            console.warn('[Realtime] Connection lost:', subscribeStatus)
            if (!isReconnectingRef.current) {
              setStatus('error')
              scheduleReconnect()
            }
            break
        }
      })

    channelRef.current = channel
  }, [code, role, setStatus, updateViewerCount, reset, cleanup])

  // Função para agendar reconexão
  const scheduleReconnect = useCallback(() => {
    if (isReconnectingRef.current) return
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[Realtime] Max reconnect attempts reached')
      setStatus('error')
      return
    }

    isReconnectingRef.current = true
    reconnectAttemptsRef.current++
    setStatus('connecting')

    const delay = RECONNECT_DELAY_MS * Math.min(reconnectAttemptsRef.current, 5)
    console.log(
      `[Realtime] Scheduling reconnect attempt ${reconnectAttemptsRef.current} in ${delay}ms`
    )

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('[Realtime] Attempting to reconnect...')
      createChannel()
    }, delay)
  }, [createChannel, setStatus])

  // Função para reconexão manual
  const reconnect = useCallback(async () => {
    if (!code || role === 'none') return

    console.log('[Realtime] Manual reconnect requested')
    reconnectAttemptsRef.current = 0
    isReconnectingRef.current = false

    cleanup()
    setStatus('connecting')

    // Pequeno delay para garantir cleanup
    await new Promise((resolve) => setTimeout(resolve, 100))
    createChannel()
  }, [code, role, cleanup, createChannel, setStatus])

  // Efeito principal - criar channel quando tiver código e role
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !code || role === 'none') {
      cleanup()
      return
    }

    // Criar channel inicial
    setStatus('connecting')
    createChannel()

    return () => {
      cleanup()
    }
  }, [code, role]) // Não incluir createChannel/cleanup para evitar loops

  // Heartbeat para verificar conexão
  useEffect(() => {
    if (!code || role === 'none' || status !== 'connected') {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
      return
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (!channelRef.current) {
        console.warn('[Realtime] Heartbeat: No channel, triggering reconnect')
        scheduleReconnect()
        return
      }

      // Verificar estado do channel
      const state = channelRef.current.state
      if (state !== 'joined') {
        console.warn('[Realtime] Heartbeat: Channel not joined, state:', state)
        scheduleReconnect()
      } else {
        // Se estiver conectado e for host, verificar se há pendências
        if (role === 'host') {
          const { hasPendingChanges } = useSyncStore.getState()
          if (hasPendingChanges) {
            console.log('[Realtime] Heartbeat: Found pending changes, flushing...')
            useSyncStore.getState().flushPendingSync()
          }
        }
      }
    }, HEARTBEAT_INTERVAL_MS)

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
    }
  }, [code, role, status, scheduleReconnect])

  // Listener para visibilitychange (quando dispositivo sai do modo sleep)
  useEffect(() => {
    if (!code || role === 'none') return

    let visibilityTimeout: ReturnType<typeof setTimeout> | null = null

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Realtime] Page became visible, checking connection...')

        // Pequeno delay para permitir que a rede se estabilize
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout)
        }

        visibilityTimeout = setTimeout(() => {
          // Verificar se channel ainda está conectado
          const channelState = channelRef.current?.state
          const isConnected = channelState === 'joined'

          console.log('[Realtime] Channel state:', channelState, 'isConnected:', isConnected)

          if (!isConnected) {
            console.log('[Realtime] Connection lost while hidden, reconnecting...')
            reconnect()
          } else {
            // Mesmo conectado, forçar flush de pendências para o host
            if (role === 'host') {
              console.log('[Realtime] Host: Flushing pending sync after visibility change')
              useSyncStore.getState().flushPendingSync()
            }
          }
        }, VISIBILITY_RECONNECT_DELAY_MS)
      } else {
        // Quando sai de vista, limpar timeout pendente
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout)
          visibilityTimeout = null
        }
      }
    }

    const handleOnline = () => {
      console.log('[Realtime] Network came online, reconnecting...')
      reconnect()
    }

    const handleFocus = () => {
      // Verificação adicional quando a janela ganha foco
      if (document.visibilityState === 'visible') {
        const channelState = channelRef.current?.state
        if (channelState !== 'joined') {
          console.log('[Realtime] Window focused but not connected, reconnecting...')
          reconnect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('focus', handleFocus)

    return () => {
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('focus', handleFocus)
    }
  }, [code, role, reconnect])

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
