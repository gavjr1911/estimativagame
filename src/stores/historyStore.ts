import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameHistory } from '../types'

interface HistoryState {
  history: GameHistory[]

  // Actions
  addGame: (game: GameHistory) => void
  removeGame: (id: string) => void
  clearHistory: () => void

  // Getters
  getGameById: (id: string) => GameHistory | undefined
  getRecentGames: (limit?: number) => GameHistory[]
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],

      addGame: game => {
        set(state => ({
          history: [game, ...state.history],
        }))
      },

      removeGame: id => {
        set(state => ({
          history: state.history.filter(g => g.id !== id),
        }))
      },

      clearHistory: () => {
        set({ history: [] })
      },

      getGameById: id => {
        return get().history.find(g => g.id === id)
      },

      getRecentGames: (limit = 10) => {
        return get().history.slice(0, limit)
      },
    }),
    {
      name: 'estimativa-history',
    }
  )
)
