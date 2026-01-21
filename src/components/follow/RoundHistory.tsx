import { useState } from 'react'
import type { Game, Round, Player } from '../../types'

interface RoundHistoryProps {
  game: Game
}

/**
 * Histórico de rodadas anteriores
 */
export default function RoundHistory({ game }: RoundHistoryProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null)

  const finishedRounds = game.rounds.filter(r => r.status === 'finished')

  if (finishedRounds.length === 0) {
    return null
  }

  const getPlayer = (playerId: string): Player | undefined => {
    return game.players.find(p => p.id === playerId)
  }

  const toggleRound = (roundNumber: number) => {
    setExpandedRound(expandedRound === roundNumber ? null : roundNumber)
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>📜</span>
        <span>Histórico</span>
        <span className="text-sm font-normal text-white/50">
          ({finishedRounds.length} rodadas)
        </span>
      </h2>

      {/* Chips das rodadas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {finishedRounds.map((round) => (
          <button
            key={round.number}
            onClick={() => toggleRound(round.number)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              expandedRound === round.number
                ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-transparent'
            }`}
          >
            R{round.number}
            <span className="ml-1 text-xs opacity-70">({round.cardCount}🃏)</span>
          </button>
        ))}
      </div>

      {/* Detalhes da rodada expandida */}
      {expandedRound && (
        <RoundHistoryDetail
          round={finishedRounds.find(r => r.number === expandedRound)!}
          getPlayer={getPlayer}
        />
      )}
    </div>
  )
}

interface RoundHistoryDetailProps {
  round: Round
  getPlayer: (playerId: string) => Player | undefined
}

function RoundHistoryDetail({ round, getPlayer }: RoundHistoryDetailProps) {
  // Ordenar por pontuação da rodada (melhor para pior)
  const sortedPlayers = [...round.players].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  )

  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-medium">
          Rodada {round.number} - {round.cardCount} cartas
        </div>
        <div className="text-white/50 text-sm">
          Dealer: {getPlayer(round.dealerId)?.name}
        </div>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map((rp, index) => {
          const player = getPlayer(rp.playerId)
          if (!player) return null

          const isHit = rp.estimate === rp.wins
          const isZeroHit = isHit && rp.estimate === 0

          return (
            <div
              key={rp.playerId}
              className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm w-5">{index + 1}.</span>
                <span className="text-white">{player.name}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="text-white/60">
                  <span className="text-white/40">Est:</span>{' '}
                  <span className="text-white">{rp.estimate}</span>
                </div>
                <div className="text-white/60">
                  <span className="text-white/40">Fez:</span>{' '}
                  <span className={isHit ? 'text-green-400' : 'text-white'}>
                    {rp.wins}
                  </span>
                </div>
                <div className={`font-medium min-w-[50px] text-right ${
                  (rp.score ?? 0) > 0
                    ? 'text-green-400'
                    : (rp.score ?? 0) < 0
                      ? 'text-red-400'
                      : 'text-white/60'
                }`}>
                  {(rp.score ?? 0) > 0 ? '+' : ''}{rp.score}
                  {isZeroHit && ' 🎯'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
