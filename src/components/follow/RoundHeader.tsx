import type { Game, Round, Player } from '../../types'

interface RoundHeaderProps {
  game: Game
  currentRound: Round
  dealer: Player
}

/**
 * Cabeçalho com informações da rodada atual
 */
export default function RoundHeader({ game, currentRound, dealer }: RoundHeaderProps) {
  const statusConfig = {
    estimating: {
      label: 'Estimando',
      icon: '⏳',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    playing: {
      label: 'Jogando',
      icon: '🎮',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    finished: {
      label: 'Finalizada',
      icon: '✅',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
  }

  const status = statusConfig[currentRound.status]

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      {/* Linha principal */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">
            Rodada {currentRound.number}
          </span>
          <span className="text-white/50">de {game.totalRounds}</span>
        </div>

        <div className="flex items-center gap-2 text-white/70">
          <span className="text-xl">🃏</span>
          <span className="text-lg font-medium">{currentRound.cardCount} cartas</span>
        </div>
      </div>

      {/* Linha secundária */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/60">
          <span>Dealer:</span>
          <span className="font-medium text-white">{dealer.name}</span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor}`}>
          <span>{status.icon}</span>
          <span className={`text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>Progresso da partida</span>
          <span>{Math.round((currentRound.number / game.totalRounds) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentRound.number / game.totalRounds) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
