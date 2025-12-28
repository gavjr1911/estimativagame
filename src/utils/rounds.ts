/**
 * Calcula o número máximo de cartas que podem ser distribuídas por jogador
 * Reservamos 1 carta para revelar o naipe curinga
 * Limitamos a 12 cartas máximo para jogos com 2-4 jogadores (evita partidas muito longas)
 *
 * @param playerCount Número de jogadores (2-10)
 * @returns Máximo de cartas por jogador
 */
export function calculateMaxCards(playerCount: number): number {
  if (playerCount < 2 || playerCount > 10) {
    throw new Error('Número de jogadores deve ser entre 2 e 10')
  }
  // 52 cartas - 1 para o curinga = 51 disponíveis
  const calculated = Math.floor(51 / playerCount)
  // Limitar a 12 cartas máximo (mesmo limite de 4 jogadores)
  return Math.min(calculated, 12)
}

/**
 * Gera a sequência de rodadas (quantidade de cartas em cada rodada)
 *
 * Regra:
 * - Subindo: 2, 4, 6, 8... (pares até o máximo par <= max)
 * - Descendo: max-1, max-3, max-5... (ímpares até 1)
 *
 * @param playerCount Número de jogadores
 * @returns Array com a quantidade de cartas em cada rodada
 *
 * @example
 * // 4 jogadores: max = 12
 * generateRoundSequence(4) // [2, 4, 6, 8, 10, 12, 11, 9, 7, 5, 3, 1]
 */
export function generateRoundSequence(playerCount: number): number[] {
  const max = calculateMaxCards(playerCount)
  const ascending: number[] = []
  const descending: number[] = []

  // Subindo (pares): 2, 4, 6...
  for (let i = 2; i <= max; i += 2) {
    ascending.push(i)
  }

  // Descendo (ímpares): começa do maior ímpar <= max, vai até 1
  const startDesc = max % 2 === 0 ? max - 1 : max
  for (let i = startDesc; i >= 1; i -= 2) {
    descending.push(i)
  }

  return [...ascending, ...descending]
}

/**
 * Calcula o total de rodadas para um número de jogadores
 */
export function getTotalRounds(playerCount: number): number {
  return generateRoundSequence(playerCount).length
}

/**
 * Retorna informações sobre as rodadas para exibição
 */
export function getRoundsInfo(playerCount: number): {
  total: number
  maxCards: number
  sequence: number[]
} {
  const sequence = generateRoundSequence(playerCount)
  return {
    total: sequence.length,
    maxCards: calculateMaxCards(playerCount),
    sequence,
  }
}
