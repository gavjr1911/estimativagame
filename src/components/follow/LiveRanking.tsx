import type { Game, Player, Round } from '../../types'

interface LiveRankingProps {
  game: Game
  currentRound: Round
}

interface PlayerRankData {
  player: Player
  position: number
  roundScore: number | null
  previousPosition: number | null
}

/**
 * Ranking ao vivo com barras de progresso
 */
export default function LiveRanking({ game, currentRound }: LiveRankingProps) {
  // Calcular ranking atual
  const sortedPlayers = [...game.players].sort((a, b) => b.totalScore - a.totalScore)
  const maxScore = Math.max(...sortedPlayers.map(p => p.totalScore), 1)

  // Obter pontuação da rodada atual para cada jogador
  const getRoundScore = (playerId: string): number | null => {
    if (currentRound.status !== 'finished') return null
    const roundPlayer = currentRound.players.find(rp => rp.playerId === playerId)
    return roundPlayer?.score ?? null
  }

  // Calcular posição anterior (antes da rodada atual)
  const getPreviousPosition = (player: Player): number | null => {
    if (currentRound.status !== 'finished') return null
    const roundScore = getRoundScore(player.id)
    if (roundScore === null) return null

    const previousScores = game.players.map(p => {
      const rs = getRoundScore(p.id)
      return { id: p.id, score: p.totalScore - (rs ?? 0) }
    })
    previousScores.sort((a, b) => b.score - a.score)
    return previousScores.findIndex(p => p.id === player.id) + 1
  }

  const rankData: PlayerRankData[] = sortedPlayers.map((player, index) => ({
    player,
    position: index + 1,
    roundScore: getRoundScore(player.id),
    previousPosition: getPreviousPosition(player),
  }))

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `${position}º`
    }
  }

  const getPositionChange = (current: number, previous: number | null) => {
    if (previous === null) return null
    const diff = previous - current
    if (diff > 0) return { type: 'up', value: diff }
    if (diff < 0) return { type: 'down', value: Math.abs(diff) }
    return { type: 'same', value: 0 }
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🏆</span>
        <span>Ranking</span>
      </h2>

      <div className="space-y-3">
        {rankData.map(({ player, position, roundScore, previousPosition }) => {
          const positionChange = getPositionChange(position, previousPosition)
          const progressPercent = maxScore > 0 ? (player.totalScore / maxScore) * 100 : 0

          return (
            <div key={player.id} className="relative">
              {/* Linha do jogador */}
              <div className="flex items-center gap-3 mb-1">
                {/* Posição */}
                <div className="w-8 text-center">
                  <span className={position <= 3 ? 'text-lg' : 'text-sm text-white/60'}>
                    {getPositionIcon(position)}
                  </span>
                </div>

                {/* Nome */}
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium truncate block">
                    {player.name}
                  </span>
                </div>

                {/* Mudança de posição */}
                {positionChange && positionChange.type !== 'same' && (
                  <div className={`flex items-center gap-0.5 text-xs ${
                    positionChange.type === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span>{positionChange.type === 'up' ? '▲' : '▼'}</span>
                    <span>{positionChange.value}</span>
                  </div>
                )}

                {/* Pontos da rodada */}
                {roundScore !== null && (
                  <div className={`text-sm font-medium ${
                    roundScore > 0 ? 'text-green-400' : roundScore < 0 ? 'text-red-400' : 'text-white/60'
                  }`}>
                    {roundScore > 0 ? '+' : ''}{roundScore}
                  </div>
                )}

                {/* Pontuação total */}
                <div className="text-right min-w-[60px]">
                  <span className="text-white font-bold">{player.totalScore}</span>
                  <span className="text-white/40 text-sm ml-1">pts</span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="ml-11 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    position === 1
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                      : position === 2
                        ? 'bg-gradient-to-r from-gray-400 to-gray-300'
                        : position === 3
                          ? 'bg-gradient-to-r from-orange-600 to-orange-500'
                          : 'bg-gradient-to-r from-blue-500 to-blue-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
