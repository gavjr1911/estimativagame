import { useState, useEffect, useCallback, useRef } from 'react'
import type { Game } from '../types'
import type { InsightsState, InsightsHistoryEntry, GameInsights } from '../types/insights'
import { generateInsights } from '../services/insightsService'

// Configurações
const CACHE_TTL_MS = 180000 // 3 minutos de cache (reduz chamadas à API)
const MIN_ROUNDS_FOR_INSIGHTS = 2 // Mínimo de rodadas finalizadas para gerar insights
const MAX_HISTORY_ENTRIES = 3 // Máximo de entradas no histórico (reduzido para economizar tokens)

interface UseGameInsightsOptions {
  /** Se deve gerar insights automaticamente quando o jogo muda */
  autoGenerate?: boolean
  /** Intervalo mínimo entre gerações automáticas (ms) */
  minInterval?: number
}

/**
 * Extrai um resumo do histórico a partir dos insights gerados
 */
function extractHistoryEntry(insights: GameInsights): InsightsHistoryEntry {
  // Extrair apelidos dos perfis
  const playerNicknames: Record<string, string> = {}
  insights.profiles?.forEach(p => {
    if (p.playerName && p.nickname) {
      playerNicknames[p.playerName] = p.nickname
    }
  })

  // Extrair momentos-chave
  const keyMoments: string[] = []

  // Adicionar destaques
  insights.highlights?.slice(0, 2).forEach(h => {
    if (h.message) keyMoments.push(h.message)
  })

  // Adicionar momentos de momentum importantes
  insights.momentum?.forEach(m => {
    if (m.type === 'on_fire' || m.type === 'comeback') {
      keyMoments.push(`${m.playerName}: ${m.message}`)
    }
  })

  return {
    roundNumber: insights.roundNumber,
    narrativeSummary: insights.narrativeSummary || insights.race?.summary || '',
    keyMoments: keyMoments.slice(0, 3),
    playerNicknames,
  }
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

  // Histórico de insights para contexto
  const [insightsHistory, setInsightsHistory] = useState<InsightsHistoryEntry[]>([])

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
        error: `Aguardando ${MIN_ROUNDS_FOR_INSIGHTS - finishedRounds} rodada(s) para gerar insights`,
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
      console.log('[Insights] Using history with', insightsHistory.length, 'entries')

      // Passar histórico para manter contexto narrativo
      const insights = await generateInsights(game, insightsHistory)

      setState({
        insights,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      })

      // Atualizar histórico com os novos insights
      if (insights) {
        const historyEntry = extractHistoryEntry(insights)
        setInsightsHistory(prev => {
          // Evitar duplicatas da mesma rodada
          const filtered = prev.filter(h => h.roundNumber !== insights.roundNumber)
          // Manter apenas as últimas N entradas
          const updated = [...filtered, historyEntry].slice(-MAX_HISTORY_ENTRIES)
          console.log('[Insights] Updated history:', updated.length, 'entries')
          return updated
        })
      }

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
  }, [game, state.lastUpdated, insightsHistory])

  /**
   * Força regeneração dos insights
   */
  const refresh = useCallback(() => {
    return generate(true)
  }, [generate])

  /**
   * Limpa os insights e histórico
   */
  const clear = useCallback(() => {
    setState({
      insights: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    })
    setInsightsHistory([])
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

  // Calcular rodadas restantes para poder gerar
  const finishedRounds = game?.rounds.filter(r => r.status === 'finished').length ?? 0
  const roundsUntilInsights = Math.max(0, MIN_ROUNDS_FOR_INSIGHTS - finishedRounds)

  return {
    ...state,
    generate,
    refresh,
    clear,
    hasInsights: !!state.insights,
    canGenerate: !!game && finishedRounds >= MIN_ROUNDS_FOR_INSIGHTS,
    roundsUntilInsights,
    minRoundsRequired: MIN_ROUNDS_FOR_INSIGHTS,
    historyLength: insightsHistory.length,
  }
}
