import type { Player } from '../types'

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
 * Retorna a ordem de estimativa baseada na posição do dealer
 *
 * A estimativa começa pelo jogador à DIREITA do dealer e segue
 * no sentido ANTI-HORÁRIO (posições decrescentes, com wrap-around)
 *
 * @param players Lista de jogadores ordenada por posição
 * @param dealerPosition Posição do dealer na mesa
 * @returns Jogadores na ordem de estimativa
 *
 * @example
 * // 4 jogadores nas posições 1, 2, 3, 4
 * // Dealer na posição 3
 * // Ordem: 2, 1, 4, 3 (começa à direita do dealer, sentido anti-horário)
 */
export function getEstimateOrder(players: Player[], dealerPosition: number): Player[] {
  const sorted = [...players].sort((a, b) => a.position - b.position)
  const dealerIndex = sorted.findIndex(p => p.position === dealerPosition)

  if (dealerIndex === -1) {
    throw new Error('Dealer não encontrado na lista de jogadores')
  }

  const result: Player[] = []

  // Começa pela direita do dealer (posição anterior) e vai no sentido anti-horário
  for (let i = 1; i <= sorted.length; i++) {
    // Posição anterior ao dealer (anti-horário)
    const index = (dealerIndex - i + sorted.length) % sorted.length
    result.push(sorted[index])
  }

  return result
}

/**
 * Retorna o próximo dealer (quem estimou primeiro na rodada anterior)
 *
 * @param players Lista de jogadores
 * @param currentDealerPosition Posição do dealer atual
 * @returns Player que será o próximo dealer
 */
export function getNextDealer(players: Player[], currentDealerPosition: number): Player {
  const estimateOrder = getEstimateOrder(players, currentDealerPosition)
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
