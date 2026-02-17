/**
 * Tipos para os insights gerados por AI
 */

/**
 * Insight sobre o momento do jogo (sequências, fases)
 */
export interface MomentumInsight {
  playerName: string
  type: 'on_fire' | 'bad_phase' | 'comeback' | 'consistent' | 'volatile'
  message: string
}

/**
 * Projeção de um jogador na corrida
 */
export interface RaceProjection {
  playerName: string
  currentScore: number
  projectedScore: number
  position: number
  message: string
}

/**
 * Insight sobre a corrida pelo título
 */
export interface RaceInsight {
  summary: string
  projections: RaceProjection[]
  turnoverChance: string
  roundsLeft: number
}

/**
 * Perfil de um jogador
 */
export interface PlayerProfile {
  playerName: string
  nickname: string
  style: 'conservador' | 'agressivo' | 'equilibrado' | 'imprevisivel'
  strengths: string[]
  weaknesses: string[]
  funFact: string
}

/**
 * Análise de assertividade por faixa
 */
export interface AccuracyByRange {
  range: string
  percentage: number
  total: number
  hits: number
}

/**
 * Insight de assertividade
 */
export interface AccuracyInsight {
  byPlayer: {
    playerName: string
    overall: number
    byRange: AccuracyByRange[]
  }[]
  tips: string[]
}

/**
 * Tendência detectada
 */
export interface TrendInsight {
  playerName: string
  type: 'overestimate' | 'underestimate' | 'calibrated' | 'early_game' | 'late_game'
  message: string
  value?: number
}

/**
 * Destaque da partida
 */
export interface HighlightInsight {
  type: 'best_round' | 'worst_round' | 'biggest_comeback' | 'most_consistent' | 'most_volatile' | 'epic_moment'
  playerName: string
  round?: number
  value?: number
  message: string
}

/**
 * Todos os insights gerados
 */
export interface GameInsights {
  generatedAt: string
  roundNumber: number
  momentum: MomentumInsight[]
  race: RaceInsight
  profiles: PlayerProfile[]
  accuracy?: AccuracyInsight
  trends: TrendInsight[]
  highlights: HighlightInsight[]
  /** Resumo narrativo para continuidade */
  narrativeSummary?: string
}

/**
 * Histórico resumido de insights para contexto
 */
export interface InsightsHistoryEntry {
  roundNumber: number
  narrativeSummary: string
  keyMoments: string[]
  playerNicknames: Record<string, string>
}

/**
 * Estado do hook de insights
 */
export interface InsightsState {
  insights: GameInsights | null
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
}
