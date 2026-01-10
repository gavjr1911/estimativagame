import type { Game } from './game'

/**
 * Tipos para o banco de dados Supabase
 */

export type SharedGameStatus = 'active' | 'finished' | 'expired'

export interface SharedGameRow {
  id: string
  code: string
  host_device_id: string
  game_data: Game
  viewer_count: number
  created_at: string
  updated_at: string
  status: SharedGameStatus
}

export type SharedGameInsert = {
  code: string
  host_device_id: string
  game_data: Game
  status: string
  id?: string
  created_at?: string
  updated_at?: string
  viewer_count?: number
}

export type SharedGameUpdate = {
  game_data?: Game
  status?: string
  viewer_count?: number
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      shared_games: {
        Row: SharedGameRow
        Insert: SharedGameInsert
        Update: SharedGameUpdate
      }
    }
  }
}
