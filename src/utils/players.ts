import type { Player, GameDirection } from '../types'

/**
 * Gera um ID único para um jogador
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Cria um novo jogador
 *
 * @param name Nome do jogador
 * @param position Posição na mesa (1-10)
 * @returns Objeto Player
 */
export function createPlayer(name: string, position: number): Player {
  return {
    id: generatePlayerId(),
    name: name.trim(),
    position,
    totalScore: 0,
  }
}

/**
 * Retorna a ordem de estimativa baseada na posição do dealer e sentido do jogo
 *
 * @param players Lista de jogadores ordenada por posição
 * @param dealerPosition Posição do dealer na mesa
 * @param direction Sentido do jogo (clockwise ou counterclockwise)
 * @returns Jogadores na ordem de estimativa
 *
 * @example
 * // 4 jogadores nas posições 1, 2, 3, 4
 * // Dealer na posição 2
 * // Sentido horário: 3, 4, 1, 2 (próxima posição)
 * // Sentido anti-horário: 1, 4, 3, 2 (posição anterior)
 */
export function getEstimateOrder(
  players: Player[],
  dealerPosition: number,
  direction: GameDirection = 'counterclockwise'
): Player[] {
  const sorted = [...players].sort((a, b) => a.position - b.position)
  const dealerIndex = sorted.findIndex(p => p.position === dealerPosition)

  if (dealerIndex === -1) {
    throw new Error('Dealer não encontrado na lista de jogadores')
  }

  const result: Player[] = []

  for (let i = 1; i <= sorted.length; i++) {
    let index: number
    if (direction === 'clockwise') {
      // Sentido horário: próxima posição (índice crescente)
      index = (dealerIndex + i) % sorted.length
    } else {
      // Sentido anti-horário: posição anterior (índice decrescente)
      index = (dealerIndex - i + sorted.length) % sorted.length
    }
    result.push(sorted[index])
  }

  return result
}

/**
 * Retorna o próximo dealer (quem estimou primeiro na rodada anterior)
 *
 * @param players Lista de jogadores
 * @param currentDealerPosition Posição do dealer atual
 * @param direction Sentido do jogo
 * @returns Player que será o próximo dealer
 */
export function getNextDealer(
  players: Player[],
  currentDealerPosition: number,
  direction: GameDirection = 'counterclockwise'
): Player {
  const estimateOrder = getEstimateOrder(players, currentDealerPosition, direction)
  // O primeiro a estimar vira o próximo dealer
  return estimateOrder[0]
}

/**
 * Encontra um jogador por ID
 */
export function findPlayerById(players: Player[], id: string): Player | undefined {
  return players.find(p => p.id === id)
}

/**
 * Encontra um jogador por posição
 */
export function findPlayerByPosition(players: Player[], position: number): Player | undefined {
  return players.find(p => p.position === position)
}

/**
 * Ordena jogadores por pontuação (maior para menor)
 * Em caso de empate, mantém a ordem original
 */
export function sortPlayersByScore(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.totalScore - a.totalScore)
}

/**
 * Retorna os vencedores (pode haver empate)
 */
export function getWinners(players: Player[]): Player[] {
  if (players.length === 0) return []

  const sorted = sortPlayersByScore(players)
  const highestScore = sorted[0].totalScore

  return sorted.filter(p => p.totalScore === highestScore)
}
