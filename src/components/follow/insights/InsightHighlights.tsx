import type { HighlightInsight } from '../../../types/insights'
import CollapseCard from './CollapseCard'

interface InsightHighlightsProps {
  highlights: HighlightInsight[]
}

/**
 * Destaques da partida
 */
export default function InsightHighlights({ highlights }: InsightHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null
  }

  const getHighlightIcon = (type: HighlightInsight['type']) => {
    switch (type) {
      case 'best_round': return '🥇'
      case 'worst_round': return '💀'
      case 'biggest_comeback': return '🔄'
      case 'most_consistent': return '🎯'
      case 'most_volatile': return '🎢'
      case 'epic_moment': return '⚡'
    }
  }

  const getHighlightColor = (type: HighlightInsight['type']) => {
    switch (type) {
      case 'best_round': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
      case 'worst_round': return 'border-red-500/30 bg-red-500/10 text-red-300'
      case 'biggest_comeback': return 'border-green-500/30 bg-green-500/10 text-green-300'
      case 'most_consistent': return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
      case 'most_volatile': return 'border-purple-500/30 bg-purple-500/10 text-purple-300'
      case 'epic_moment': return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
    }
  }

  return (
    <CollapseCard title="Destaques da Partida" icon="🏆">
      <div className="space-y-3 pt-3">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className={`rounded-lg p-3 border ${getHighlightColor(highlight.type)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getHighlightIcon(highlight.type)}</span>
              <div className="flex-1">
                <div className="font-medium">
                  {highlight.playerName}
                  {highlight.round && (
                    <span className="text-white/50 font-normal ml-2 text-sm">
                      Rodada {highlight.round}
                    </span>
                  )}
                  {highlight.value !== undefined && (
                    <span className={`ml-2 font-bold ${
                      highlight.value > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {highlight.value > 0 ? '+' : ''}{highlight.value}
                    </span>
                  )}
                </div>
                <div className="text-white/70 text-sm mt-1">
                  {highlight.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CollapseCard>
  )
}
