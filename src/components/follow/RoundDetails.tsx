import type { Game, Round, Player } from '../../types'

interface RoundDetailsProps {
  game: Game
  currentRound: Round
}

/**
 * Detalhes da rodada atual (tabela de estimativas, vitórias e pontos)
 */
export default function RoundDetails({ game, currentRound }: RoundDetailsProps) {
  const getPlayer = (playerId: string): Player | undefined => {
    return game.players.find(p => p.id === playerId)
  }

  const isDealer = (playerId: string): boolean => {
    return currentRound.dealerId === playerId
  }

  // Ordenar jogadores pela ordem de estimativa (ou pela posição na mesa)
  const sortedRoundPlayers = [...currentRound.players].sort((a, b) => {
    const playerA = getPlayer(a.playerId)
    const playerB = getPlayer(b.playerId)
    return (playerA?.position ?? 0) - (playerB?.position ?? 0)
  })

  // Calcular totais
  const totalEstimated = sortedRoundPlayers.reduce(
    (sum, rp) => sum + (rp.estimate ?? 0),
    0
  )

  const isEstimating = currentRound.status === 'estimating'
  const isFinished = currentRound.status === 'finished'

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>📋</span>
        <span>Rodada Atual</span>
      </h2>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-white/50 text-sm border-b border-white/10">
              <th className="text-left py-2 font-medium">Jogador</th>
              <th className="text-center py-2 font-medium w-20">Estimou</th>
              <th className="text-center py-2 font-medium w-20">Fez</th>
              <th className="text-right py-2 font-medium w-20">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {sortedRoundPlayers.map((roundPlayer) => {
              const player = getPlayer(roundPlayer.playerId)
              if (!player) return null

              const hasEstimate = roundPlayer.estimate !== null
              const hasWins = roundPlayer.wins !== null
              const hasScore = roundPlayer.score !== null

              const isHit = hasEstimate && hasWins && roundPlayer.estimate === roundPlayer.wins
              const isZeroHit = isHit && roundPlayer.estimate === 0

              return (
                <tr
                  key={roundPlayer.playerId}
                  className="border-b border-white/5 last:border-0"
                >
                  {/* Nome do jogador */}
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{player.name}</span>
                      {isDealer(player.id) && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                          Dealer
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estimativa */}
                  <td className="py-3 text-center">
                    {hasEstimate ? (
                      <span className="text-white font-medium">
                        {roundPlayer.estimate}
                      </span>
                    ) : (
                      <span className="text-white/30">-</span>
                    )}
                  </td>

                  {/* Vitórias */}
                  <td className="py-3 text-center">
                    {isEstimating ? (
                      <span className="text-white/30">-</span>
                    ) : hasWins ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-white font-medium">
                          {roundPlayer.wins}
                        </span>
                        {isFinished && (
                          <span className={isHit ? 'text-green-400' : 'text-red-400'}>
                            {isHit ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30">{roundPlayer.wins ?? '-'}</span>
                    )}
                  </td>

                  {/* Pontos */}
                  <td className="py-3 text-right">
                    {hasScore ? (
                      <span className={`font-bold ${
                        roundPlayer.score! > 0
                          ? 'text-green-400'
                          : roundPlayer.score! < 0
                            ? 'text-red-400'
                            : 'text-white/60'
                      }`}>
                        {roundPlayer.score! > 0 ? '+' : ''}{roundPlayer.score}
                        {isZeroHit && <span className="ml-1 text-xs">🎯</span>}
                      </span>
                    ) : (
                      <span className="text-white/30">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="text-white/60">
            Total estimado:{' '}
            <span className={`font-medium ${
              totalEstimated === currentRound.cardCount
                ? 'text-yellow-400'
                : 'text-white'
            }`}>
              {totalEstimated}
            </span>
          </div>
          <div className="text-white/60">
            Cartas:{' '}
            <span className="font-medium text-white">{currentRound.cardCount}</span>
          </div>
        </div>

        {!isEstimating && (
          <div className={`font-medium ${
            totalEstimated === currentRound.cardCount
              ? 'text-yellow-400'
              : totalEstimated > currentRound.cardCount
                ? 'text-red-400'
                : 'text-blue-400'
          }`}>
            {totalEstimated === currentRound.cardCount
              ? 'Soma exata!'
              : totalEstimated > currentRound.cardCount
                ? `+${totalEstimated - currentRound.cardCount} além`
                : `${currentRound.cardCount - totalEstimated} abaixo`}
          </div>
        )}
      </div>
    </div>
  )
}
