import type { Game, Round, RoundPlayer, Player, GameHistory } from '../types'
import { generateRoundSequence } from './rounds'
import { createPlayer, getNextDealer, sortPlayersByScore, getWinners } from './players'

/**
 * Gera um ID único para uma partida
 */
export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Cria uma nova partida
 *
 * @param playerNames Nomes dos jogadores na ordem das posições
 * @param firstDealerPosition Posição do primeiro dealer (1-based)
 * @returns Objeto Game pronto para iniciar
 */
export function createGame(playerNames: string[], firstDealerPosition: number): Game {
  if (playerNames.length < 2 || playerNames.length > 10) {
    throw new Error('Número de jogadores deve ser entre 2 e 10')
  }

  if (firstDealerPosition < 1 || firstDealerPosition > playerNames.length) {
    throw new Error('Posição do dealer inválida')
  }

  // Criar jogadores
  const players: Player[] = playerNames.map((name, index) =>
    createPlayer(name, index + 1)
  )

  // Gerar sequência de rodadas
  const roundSequence = generateRoundSequence(players.length)

  // Criar primeira rodada
  const firstDealer = players.find(p => p.position === firstDealerPosition)!
  const firstRound = createRound(1, roundSequence[0], firstDealer.id, players)

  return {
    id: generateGameId(),
    createdAt: new Date().toISOString(),
    finishedAt: null,
    status: 'in_progress',
    players,
    rounds: [firstRound],
    currentRoundIndex: 0,
    totalRounds: roundSequence.length,
    roundSequence,
  }
}

/**
 * Cria uma nova rodada
 */
export function createRound(
  number: number,
  cardCount: number,
  dealerId: string,
  players: Player[]
): Round {
  const roundPlayers: RoundPlayer[] = players.map(p => ({
    playerId: p.id,
    estimate: null,
    wins: null,
    score: null,
  }))

  return {
    number,
    cardCount,
    dealerId,
    status: 'estimating',
    players: roundPlayers,
  }
}

/**
 * Obtém a rodada atual do jogo
 */
export function getCurrentRound(game: Game): Round {
  return game.rounds[game.currentRoundIndex]
}

/**
 * Obtém o dealer da rodada atual
 */
export function getCurrentDealer(game: Game): Player {
  const round = getCurrentRound(game)
  const dealer = game.players.find(p => p.id === round.dealerId)
  if (!dealer) {
    throw new Error('Dealer não encontrado')
  }
  return dealer
}

/**
 * Verifica se todas as estimativas foram preenchidas
 */
export function allEstimatesFilled(round: Round): boolean {
  return round.players.every(p => p.estimate !== null)
}

/**
 * Verifica se todas as vitórias foram preenchidas
 */
export function allWinsFilled(round: Round): boolean {
  return round.players.every(p => p.wins !== null)
}

/**
 * Verifica se é a última rodada
 */
export function isLastRound(game: Game): boolean {
  return game.currentRoundIndex === game.totalRounds - 1
}

/**
 * Converte uma partida finalizada em histórico
 */
export function gameToHistory(game: Game): GameHistory {
  if (game.status !== 'finished') {
    throw new Error('Apenas partidas finalizadas podem ser convertidas em histórico')
  }

  const sorted = sortPlayersByScore(game.players)
  const winners = getWinners(game.players)

  // Calcular ranking (considerando empates)
  let currentRank = 1
  let lastScore = sorted[0]?.totalScore

  const playersWithRanking = sorted.map((player, index) => {
    if (player.totalScore < lastScore) {
      currentRank = index + 1
      lastScore = player.totalScore
    }
    return {
      name: player.name,
      finalScore: player.totalScore,
      position: currentRank,
    }
  })

  return {
    id: game.id,
    date: game.finishedAt || game.createdAt,
    players: playersWithRanking,
    winners: winners.map(w => w.name),
    totalRounds: game.totalRounds,
    playerCount: game.players.length,
  }
}

/**
 * Cria a próxima rodada do jogo
 */
export function createNextRound(game: Game): Round {
  const currentRound = getCurrentRound(game)
  const nextRoundIndex = game.currentRoundIndex + 1

  if (nextRoundIndex >= game.totalRounds) {
    throw new Error('Não há mais rodadas')
  }

  const currentDealer = game.players.find(p => p.id === currentRound.dealerId)!
  const nextDealer = getNextDealer(game.players, currentDealer.position)

  return createRound(
    nextRoundIndex + 1,
    game.roundSequence[nextRoundIndex],
    nextDealer.id,
    game.players
  )
}
