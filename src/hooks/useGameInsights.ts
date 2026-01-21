import { useState, useEffect, useCallback, useRef } from 'react'
import type { Game } from '../types'
import type { InsightsState } from '../types/insights'
import { generateInsights } from '../services/insightsService'

// Configurações
const CACHE_TTL_MS = 60000 // 1 minuto de cache
const MIN_ROUNDS_FOR_INSIGHTS = 1 // Mínimo de rodadas finalizadas para gerar insights

interface UseGameInsightsOptions {
  /** Se deve gerar insights automaticamente quando o jogo muda */
  autoGenerate?: boolean
  /** Intervalo mínimo entre gerações automáticas (ms) */
  minInterval?: number
}

/**
 * Hook para gerenciar insights do jogo gerados por AI
 */
export function useGameInsights(
  game: Game | null,
  options: UseGameInsightsOptions = {}
) {
  const { autoGenerate = true, minInterval = CACHE_TTL_MS } = options

  const [state, setState] = useState<InsightsState>({
    insights: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  })

  const lastGeneratedRoundRef = useRef<number>(-1)
  const isGeneratingRef = useRef(false)

  /**
   * Gera novos insights
   */
  const generate = useCallback(async (forceRegenerate = false) => {
    if (!game) {
      setState(prev => ({ ...prev, error: 'Nenhum jogo ativo' }))
      return
    }

    // Verificar se há rodadas suficientes
    const finishedRounds = game.rounds.filter(r => r.status === 'finished').length
    if (finishedRounds < MIN_ROUNDS_FOR_INSIGHTS) {
      setState(prev => ({
        ...prev,
        error: 'Aguardando mais rodadas para gerar insights',
      }))
      return
    }

    // Verificar cache (a menos que force regeneração)
    if (!forceRegenerate && state.lastUpdated) {
      const timeSinceLastUpdate = Date.now() - state.lastUpdated
      if (timeSinceLastUpdate < CACHE_TTL_MS) {
        console.log('[Insights] Using cached insights')
        return
      }
    }

    // Evitar chamadas simultâneas
    if (isGeneratingRef.current) {
      console.log('[Insights] Already generating, skipping')
      return
    }

    isGeneratingRef.current = true
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('[Insights] Generating insights for round', game.currentRoundIndex + 1)
      const insights = await generateInsights(game)

      setState({
        insights,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      })

      lastGeneratedRoundRef.current = game.currentRoundIndex
    } catch (error) {
      console.error('[Insights] Failed to generate:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar insights',
      }))
    } finally {
      isGeneratingRef.current = false
    }
  }, [game, state.lastUpdated])

  /**
   * Força regeneração dos insights
   */
  const refresh = useCallback(() => {
    return generate(true)
  }, [generate])

  /**
   * Limpa os insights
   */
  const clear = useCallback(() => {
    setState({
      insights: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    })
    lastGeneratedRoundRef.current = -1
  }, [])

  // Auto-gerar quando uma rodada é finalizada
  useEffect(() => {
    if (!autoGenerate || !game) return

    const finishedRounds = game.rounds.filter(r => r.status === 'finished').length
    if (finishedRounds < MIN_ROUNDS_FOR_INSIGHTS) return

    // Verificar se a rodada mudou
    const currentRound = game.currentRoundIndex
    if (currentRound === lastGeneratedRoundRef.current) return

    // Verificar intervalo mínimo
    if (state.lastUpdated) {
      const timeSinceLastUpdate = Date.now() - state.lastUpdated
      if (timeSinceLastUpdate < minInterval) {
        console.log('[Insights] Too soon since last generation, skipping')
        return
      }
    }

    // Gerar novos insights
    generate()
  }, [game, autoGenerate, minInterval, generate, state.lastUpdated])

  return {
    ...state,
    generate,
    refresh,
    clear,
    hasInsights: !!state.insights,
    canGenerate: !!game && game.rounds.filter(r => r.status === 'finished').length >= MIN_ROUNDS_FOR_INSIGHTS,
  }
}
