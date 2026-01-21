import type { Game } from '../types'
import type { AccuracyInsight, AccuracyByRange } from '../types/insights'

/**
 * Calcula a assertividade dos jogadores baseado nos dados do jogo
 * Isso é calculado localmente, sem usar IA
 */
export function calculateAccuracy(game: Game): AccuracyInsight {
  const finishedRounds = game.rounds.filter(r => r.status === 'finished')

  const byPlayer = game.players.map(player => {
    // Coletar todas as estimativas do jogador
    const playerEstimates: { estimate: number; hit: boolean }[] = []

    finishedRounds.forEach(round => {
      const roundPlayer = round.players.find(p => p.playerId === player.id)
      if (roundPlayer && roundPlayer.estimate !== null && roundPlayer.wins !== null) {
        playerEstimates.push({
          estimate: roundPlayer.estimate,
          hit: roundPlayer.estimate === roundPlayer.wins,
        })
      }
    })

    // Calcular por faixa de estimativa
    const ranges: { key: string; min: number; max: number }[] = [
      { key: '0', min: 0, max: 0 },
      { key: '1-2', min: 1, max: 2 },
      { key: '3+', min: 3, max: Infinity },
    ]

    const byRange: AccuracyByRange[] = ranges.map(range => {
      const inRange = playerEstimates.filter(
        e => e.estimate >= range.min && e.estimate <= range.max
      )
      const hits = inRange.filter(e => e.hit).length
      const total = inRange.length

      return {
        range: range.key,
        percentage: total > 0 ? Math.round((hits / total) * 100) : 0,
        total,
        hits,
      }
    })

    // Calcular overall
    const totalHits = playerEstimates.filter(e => e.hit).length
    const totalEstimates = playerEstimates.length
    const overall = totalEstimates > 0 ? Math.round((totalHits / totalEstimates) * 100) : 0

    return {
      playerName: player.name,
      overall,
      byRange,
    }
  })

  // Ordenar por overall (melhor primeiro)
  byPlayer.sort((a, b) => b.overall - a.overall)

  return {
    byPlayer,
    tips: [], // Tips serão geradas pela IA ou removidas
  }
}
