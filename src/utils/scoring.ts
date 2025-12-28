import type { ScoreResult, RoundPlayer } from '../types'

/**
 * Calcula a pontuação de um jogador em uma rodada
 *
 * Regras:
 * - Acertou estimativa: +10 × vitórias
 * - Estimou zero e ganhou zero: +5 pontos
 * - Errou: -10 × |estimativa - vitórias|
 *
 * @param estimate Estimativa do jogador
 * @param wins Número de vitórias do jogador
 * @returns Pontuação da rodada
 *
 * @example
 * calculateScore(3, 3) // 30 (acertou)
 * calculateScore(0, 0) // 5 (zero certeiro)
 * calculateScore(5, 3) // -20 (errou por 2)
 */
export function calculateScore(estimate: number, wins: number): number {
  if (estimate === wins) {
    // Acertou
    return wins === 0 ? 5 : 10 * wins
  }
  // Errou
  return -10 * Math.abs(estimate - wins)
}

/**
 * Calcula os resultados de todos os jogadores em uma rodada
 *
 * @param players Array de jogadores da rodada com estimativas e vitórias
 * @returns Array de resultados com pontuação calculada
 */
export function calculateRoundResults(players: RoundPlayer[]): ScoreResult[] {
  return players.map(player => {
    if (player.estimate === null || player.wins === null) {
      throw new Error(`Jogador ${player.playerId} não tem estimativa ou vitórias definidas`)
    }

    const score = calculateScore(player.estimate, player.wins)
    const isHit = player.estimate === player.wins
    const isZeroHit = isHit && player.wins === 0

    return {
      playerId: player.playerId,
      estimate: player.estimate,
      wins: player.wins,
      score,
      isHit,
      isZeroHit,
    }
  })
}

/**
 * Valida se a soma das vitórias é igual ao número de cartas
 *
 * @param players Array de jogadores da rodada
 * @param cardCount Número de cartas da rodada
 * @returns true se a soma está correta
 */
export function validateWinsTotal(players: RoundPlayer[], cardCount: number): boolean {
  const totalWins = players.reduce((sum, p) => sum + (p.wins ?? 0), 0)
  return totalWins === cardCount
}

/**
 * Retorna a diferença entre a soma atual de vitórias e o esperado
 *
 * @param players Array de jogadores da rodada
 * @param cardCount Número de cartas da rodada
 * @returns Diferença (positivo = excesso, negativo = falta)
 */
export function getWinsDifference(players: RoundPlayer[], cardCount: number): number {
  const totalWins = players.reduce((sum, p) => sum + (p.wins ?? 0), 0)
  return totalWins - cardCount
}
