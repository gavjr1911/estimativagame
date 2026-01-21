import type { RaceInsight } from '../../../types/insights'
import CollapseCard from './CollapseCard'

interface InsightRaceProps {
  insight: RaceInsight
}

/**
 * Insights sobre a corrida pelo título
 */
export default function InsightRace({ insight }: InsightRaceProps) {
  if (!insight) {
    return null
  }

  return (
    <CollapseCard
      title="Corrida pelo Título"
      icon="🏁"
      badge={`${insight.roundsLeft} rodadas restantes`}
    >
      <div className="space-y-4 pt-3">
        {/* Resumo */}
        <div className="text-white/90 leading-relaxed">
          {insight.summary}
        </div>

        {/* Projeções */}
        <div className="space-y-3">
          <div className="text-white/50 text-sm font-medium">Projeções</div>
          {insight.projections.map((projection, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/5 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-white/50 text-sm">{projection.position}º</span>
                <div>
                  <div className="text-white font-medium">{projection.playerName}</div>
                  <div className="text-white/50 text-sm">{projection.message}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{projection.currentScore} pts</div>
                <div className="text-white/40 text-xs">→ ~{projection.projectedScore}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chances de virada */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="text-yellow-400/80 text-sm">
            {insight.turnoverChance}
          </div>
        </div>
      </div>
    </CollapseCard>
  )
}
