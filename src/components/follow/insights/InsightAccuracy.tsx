import type { AccuracyInsight } from '../../../types/insights'
import CollapseCard from './CollapseCard'

interface InsightAccuracyProps {
  insight: AccuracyInsight
}

/**
 * Insights de assertividade
 */
export default function InsightAccuracy({ insight }: InsightAccuracyProps) {
  if (!insight) {
    return null
  }

  return (
    <CollapseCard title="Assertividade Detalhada" icon="🎯">
      <div className="space-y-4 pt-3">
        {/* Tabela de assertividade por jogador e faixa */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/50 border-b border-white/10">
                <th className="text-left py-2 font-medium">Jogador</th>
                <th className="text-center py-2 font-medium">Geral</th>
                {insight.byPlayer[0]?.byRange.map((range, i) => (
                  <th key={i} className="text-center py-2 font-medium">
                    Est. {range.range}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {insight.byPlayer.map((player, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-2 text-white font-medium">
                    {player.playerName}
                  </td>
                  <td className="py-2 text-center">
                    <span className={`font-medium ${
                      player.overall >= 60 ? 'text-green-400' :
                      player.overall >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {player.overall}%
                    </span>
                  </td>
                  {player.byRange.map((range, i) => (
                    <td key={i} className="py-2 text-center">
                      {range.total > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className={`font-medium ${
                            range.percentage >= 60 ? 'text-green-400' :
                            range.percentage >= 40 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {range.percentage}%
                          </span>
                          <span className="text-white/30 text-xs">
                            {range.hits}/{range.total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dicas */}
        {insight.tips && insight.tips.length > 0 && (
          <div className="space-y-2">
            <div className="text-white/50 text-sm font-medium">Dicas</div>
            {insight.tips.map((tip, index) => (
              <div
                key={index}
                className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-300/90 text-sm"
              >
                💡 {tip}
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapseCard>
  )
}
