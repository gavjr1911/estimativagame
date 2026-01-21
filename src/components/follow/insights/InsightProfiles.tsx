import type { PlayerProfile } from '../../../types/insights'
import CollapseCard from './CollapseCard'

interface InsightProfilesProps {
  profiles: PlayerProfile[]
}

/**
 * Perfis dos jogadores
 */
export default function InsightProfiles({ profiles }: InsightProfilesProps) {
  if (!profiles || profiles.length === 0) {
    return null
  }

  const getStyleColor = (style: PlayerProfile['style']) => {
    switch (style) {
      case 'conservador': return 'text-blue-400 bg-blue-500/20'
      case 'agressivo': return 'text-red-400 bg-red-500/20'
      case 'equilibrado': return 'text-green-400 bg-green-500/20'
      case 'imprevisivel': return 'text-purple-400 bg-purple-500/20'
    }
  }

  const getStyleLabel = (style: PlayerProfile['style']) => {
    switch (style) {
      case 'conservador': return 'Conservador'
      case 'agressivo': return 'Agressivo'
      case 'equilibrado': return 'Equilibrado'
      case 'imprevisivel': return 'Imprevisível'
    }
  }

  return (
    <CollapseCard title="Perfil dos Jogadores" icon="📊">
      <div className="space-y-4 pt-3">
        {profiles.map((profile, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-white font-medium">{profile.playerName}</div>
                <div className="text-white/50 text-sm italic">"{profile.nickname}"</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getStyleColor(profile.style)}`}>
                {getStyleLabel(profile.style)}
              </span>
            </div>

            {/* Pontos fortes e fracos */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <div className="text-green-400/70 text-xs mb-1">Pontos fortes</div>
                <ul className="space-y-1">
                  {profile.strengths.map((s, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-1">
                      <span className="text-green-400">+</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-red-400/70 text-xs mb-1">Pontos fracos</div>
                <ul className="space-y-1">
                  {profile.weaknesses.map((w, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-1">
                      <span className="text-red-400">-</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Fun fact */}
            <div className="text-white/60 text-sm italic border-t border-white/10 pt-2">
              💡 {profile.funFact}
            </div>
          </div>
        ))}
      </div>
    </CollapseCard>
  )
}
