import type { MomentumInsight } from '../../../types/insights'
import CollapseCard from './CollapseCard'

interface InsightMomentumProps {
  insights: MomentumInsight[]
}

/**
 * Insights sobre o momento do jogo (sequências, fases)
 */
export default function InsightMomentum({ insights }: InsightMomentumProps) {
  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <CollapseCard title="Momento do Jogo" icon="🔥" defaultOpen={true}>
      <div className="space-y-3 pt-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="text-white/90 leading-relaxed"
          >
            {insight.message}
          </div>
        ))}
      </div>
    </CollapseCard>
  )
}
