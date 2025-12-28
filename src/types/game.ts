/**
 * Jogador
 */
export interface Player {
  id: string
  name: string
  position: number // 1-10, posição na mesa (sentido horário)
  totalScore: number // Pontuação acumulada
}

/**
 * Dados do jogador em uma rodada específica
 */
export interface RoundPlayer {
  playerId: string
  estimate: number | null // Estimativa (null = ainda não informou)
  wins: number | null // Vitórias (null = rodada não finalizada)
  score: number | null // Pontos da rodada (calculado ao finalizar)
}

/**
 * Status de uma rodada
 */
export type RoundStatus = 'estimating' | 'playing' | 'finished'

/**
 * Uma rodada do jogo
 */
export interface Round {
  number: number // Número da rodada (1, 2, 3...)
  cardCount: number // Quantidade de cartas distribuídas
  dealerId: string // ID do jogador que é o dealer
  status: RoundStatus
  players: RoundPlayer[]
}

/**
 * Status do jogo
 */
export type GameStatus = 'setup' | 'in_progress' | 'finished'

/**
 * Uma partida completa
 */
export interface Game {
  id: string
  createdAt: string // ISO date string
  finishedAt: string | null
  status: GameStatus
  players: Player[]
  rounds: Round[]
  currentRoundIndex: number
  totalRounds: number
  roundSequence: number[] // Sequência de cartas por rodada [2, 4, 6, 8, 7, 5, 3, 1]
}

/**
 * Histórico de uma partida finalizada
 */
export interface GameHistory {
  id: string
  date: string // ISO date string
  players: {
    name: string
    finalScore: number
    position: number // Ranking final (1 = primeiro lugar)
  }[]
  winners: string[] // Nomes dos vencedores (pode ter empate)
  totalRounds: number
  playerCount: number
}

/**
 * Resultado do cálculo de pontuação
 */
export interface ScoreResult {
  playerId: string
  estimate: number
  wins: number
  score: number
  isHit: boolean // Acertou a estimativa?
  isZeroHit: boolean // Acertou zero?
}
