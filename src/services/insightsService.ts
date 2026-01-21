import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Game } from '../types'
import type { GameInsights, InsightsHistoryEntry } from '../types/insights'

const FUNCTION_NAME = 'generate-insights'

/**
 * Gera insights da partida usando AI via Supabase Edge Function
 * @param game - Estado atual do jogo
 * @param history - Histórico de insights anteriores para manter contexto
 */
export async function generateInsights(
  game: Game,
  history: InsightsHistoryEntry[] = []
): Promise<GameInsights> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não está configurado')
  }

  console.log('[Insights] Calling Edge Function with game:', game.id)
  console.log('[Insights] Rounds finished:', game.rounds.filter(r => r.status === 'finished').length)
  console.log('[Insights] History entries:', history.length)

  // Validar estrutura mínima
  if (!game.players || game.players.length === 0) {
    throw new Error('Jogo sem jogadores')
  }
  if (!game.rounds || game.rounds.length === 0) {
    throw new Error('Jogo sem rodadas')
  }

  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: {
        gameData: game,
        insightsHistory: history,
      },
    })

    console.log('[Insights] Response:', { data, error })

    if (error) {
      console.error('[Insights] Error calling Edge Function:', error)
      // Verificar se é erro de rede ou status
      if (error.message?.includes('non-2xx')) {
        throw new Error('Erro na geração de insights. Tente novamente.')
      }
      throw new Error(error.message || 'Erro ao gerar insights')
    }

    if (data?.error) {
      console.error('[Insights] Edge Function returned error:', data.error)
      throw new Error(data.error)
    }

    return data as GameInsights
  } catch (err) {
    console.error('[Insights] Exception:', err)
    throw err
  }
}

/**
 * Verifica se a Edge Function está disponível
 */
export async function checkInsightsAvailable(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }

  try {
    // Fazer uma chamada de teste simples
    // Em produção, poderíamos ter um endpoint de health check
    return true
  } catch {
    return false
  }
}
