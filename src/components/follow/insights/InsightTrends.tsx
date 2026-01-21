import type { TrendInsight } from '../../../types/insights'
import CollapseCard from './CollapseCard'

interface InsightTrendsProps {
  trends: TrendInsight[]
}

/**
 * Insights de tendências detectadas
 */
export default function InsightTrends({ trends }: InsightTrendsProps) {
  if (!trends || trends.length === 0) {
    return null
  }

  const getTrendIcon = (type: TrendInsight['type']) => {
    switch (type) {
      case 'overestimate': return '🔼'
      case 'underestimate': return '🔽'
      case 'calibrated': return '✅'
      case 'early_game': return '🌅'
      case 'late_game': return '🌙'
    }
  }

  const getTrendColor = (type: TrendInsight['type']) => {
    switch (type) {
      case 'overestimate': return 'border-orange-500/30 bg-orange-500/10'
      case 'underestimate': return 'border-blue-500/30 bg-blue-500/10'
      case 'calibrated': return 'border-green-500/30 bg-green-500/10'
      case 'early_game': return 'border-yellow-500/30 bg-yellow-500/10'
      case 'late_game': return 'border-purple-500/30 bg-purple-500/10'
    }
  }

  return (
    <CollapseCard title="Tendências" icon="📈">
      <div className="space-y-3 pt-3">
        {trends.map((trend, index) => (
          <div
            key={index}
            className={`rounded-lg p-3 border ${getTrendColor(trend.type)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getTrendIcon(trend.type)}</span>
              <div className="flex-1">
                <span className="text-white font-medium">{trend.playerName}</span>
                <span className="text-white/70 ml-1">{trend.message}</span>
                {trend.value !== undefined && (
                  <span className="text-white/50 ml-1">
                    ({trend.value > 0 ? '+' : ''}{trend.value})
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CollapseCard>
  )
}
