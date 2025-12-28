import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Game, Player, Round, RoundPlayer } from '../types'
import {
  createGame as createGameUtil,
  getCurrentRound,
  getCurrentDealer,
  getEstimateOrder,
  allEstimatesFilled,
  allWinsFilled,
  isLastRound,
  createNextRound,
  calculateRoundResults,
  validateWinsTotal,
  gameToHistory,
} from '../utils'
import { useHistoryStore } from './historyStore'

interface GameState {
  game: Game | null

  // Actions - Setup
  createGame: (playerNames: string[], firstDealerPosition: number) => void
  resetGame: () => void

  // Actions - Estimativas
  setEstimate: (playerId: string, estimate: number) => void
  confirmEstimates: () => void

  // Actions - Resultados
  setWins: (playerId: string, wins: number) => void
  finishRound: () => void

  // Actions - Navegação
  nextRound: () => void
  finishGame: () => void

  // Getters
  getCurrentRound: () => Round | null
  getDealer: () => Player | null
  getEstimateOrder: () => Player[]
  canConfirmEstimates: () => boolean
  canFinishRound: () => boolean
  getWinsValidation: () => { isValid: boolean; difference: number }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: null,

      // ========== SETUP ==========

      createGame: (playerNames, firstDealerPosition) => {
        const game = createGameUtil(playerNames, firstDealerPosition)
        set({ game })
      },

      resetGame: () => {
        set({ game: null })
      },

      // ========== ESTIMATIVAS ==========

      setEstimate: (playerId, estimate) => {
        const { game } = get()
        if (!game) return

        const round = getCurrentRound(game)
        if (round.status !== 'estimating') return

        // Validar: estimativa não pode ser maior que número de cartas
        if (estimate < 0 || estimate > round.cardCount) return

        const updatedPlayers = round.players.map(p =>
          p.playerId === playerId ? { ...p, estimate } : p
        )

        const updatedRound = { ...round, players: updatedPlayers }
        const updatedRounds = game.rounds.map((r, i) =>
          i === game.currentRoundIndex ? updatedRound : r
        )

        set({ game: { ...game, rounds: updatedRounds } })
      },

      confirmEstimates: () => {
        const { game } = get()
        if (!game) return

        const round = getCurrentRound(game)
        if (!allEstimatesFilled(round)) return

        // Inicializar wins como 0 para todos os jogadores
        const updatedPlayers = round.players.map(p => ({
          ...p,
          wins: 0,
        }))

        const updatedRound = { ...round, status: 'playing' as const, players: updatedPlayers }
        const updatedRounds = game.rounds.map((r, i) =>
          i === game.currentRoundIndex ? updatedRound : r
        )

        set({ game: { ...game, rounds: updatedRounds } })
      },

      // ========== RESULTADOS ==========

      setWins: (playerId, wins) => {
        const { game } = get()
        if (!game) return

        const round = getCurrentRound(game)
        if (round.status !== 'playing') return

        // Validar: vitórias não pode ser negativa ou maior que cartas
        if (wins < 0 || wins > round.cardCount) return

        const updatedPlayers = round.players.map(p =>
          p.playerId === playerId ? { ...p, wins } : p
        )

        const updatedRound = { ...round, players: updatedPlayers }
        const updatedRounds = game.rounds.map((r, i) =>
          i === game.currentRoundIndex ? updatedRound : r
        )

        set({ game: { ...game, rounds: updatedRounds } })
      },

      finishRound: () => {
        const { game } = get()
        if (!game) return

        const round = getCurrentRound(game)
        if (!allWinsFilled(round)) return
        if (!validateWinsTotal(round.players, round.cardCount)) return

        // Calcular pontuação
        const results = calculateRoundResults(round.players)

        // Atualizar jogadores da rodada com pontuação
        const updatedRoundPlayers: RoundPlayer[] = round.players.map(p => {
          const result = results.find(r => r.playerId === p.playerId)!
          return { ...p, score: result.score }
        })

        // Atualizar pontuação total dos jogadores
        const updatedPlayers = game.players.map(player => {
          const result = results.find(r => r.playerId === player.id)
          if (!result) return player
          return { ...player, totalScore: player.totalScore + result.score }
        })

        const updatedRound = {
          ...round,
          status: 'finished' as const,
          players: updatedRoundPlayers,
        }

        const updatedRounds = game.rounds.map((r, i) =>
          i === game.currentRoundIndex ? updatedRound : r
        )

        set({
          game: {
            ...game,
            rounds: updatedRounds,
            players: updatedPlayers,
          },
        })
      },

      // ========== NAVEGAÇÃO ==========

      nextRound: () => {
        const { game } = get()
        if (!game) return
        if (isLastRound(game)) return

        const nextRound = createNextRound(game)

        set({
          game: {
            ...game,
            rounds: [...game.rounds, nextRound],
            currentRoundIndex: game.currentRoundIndex + 1,
          },
        })
      },

      finishGame: () => {
        const { game } = get()
        if (!game) return

        const finishedGame: Game = {
          ...game,
          status: 'finished',
          finishedAt: new Date().toISOString(),
        }

        // Salvar no histórico
        const history = gameToHistory(finishedGame)
        useHistoryStore.getState().addGame(history)

        set({ game: finishedGame })
      },

      // ========== GETTERS ==========

      getCurrentRound: () => {
        const { game } = get()
        if (!game) return null
        return getCurrentRound(game)
      },

      getDealer: () => {
        const { game } = get()
        if (!game) return null
        return getCurrentDealer(game)
      },

      getEstimateOrder: () => {
        const { game } = get()
        if (!game) return []

        const dealer = getCurrentDealer(game)
        return getEstimateOrder(game.players, dealer.position)
      },

      canConfirmEstimates: () => {
        const { game } = get()
        if (!game) return false

        const round = getCurrentRound(game)
        return round.status === 'estimating' && allEstimatesFilled(round)
      },

      canFinishRound: () => {
        const { game } = get()
        if (!game) return false

        const round = getCurrentRound(game)
        return (
          round.status === 'playing' &&
          allWinsFilled(round) &&
          validateWinsTotal(round.players, round.cardCount)
        )
      },

      getWinsValidation: () => {
        const { game } = get()
        if (!game) return { isValid: false, difference: 0 }

        const round = getCurrentRound(game)
        const totalWins = round.players.reduce((sum, p) => sum + (p.wins ?? 0), 0)
        const difference = totalWins - round.cardCount

        return {
          isValid: difference === 0 && allWinsFilled(round),
          difference,
        }
      },
    }),
    {
      name: 'estimativa-game',
    }
  )
)
