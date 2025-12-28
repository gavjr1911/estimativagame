import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Logo } from '../components/ui'
import { PageContainer } from '../components/layout'
import { useGameStore } from '../stores'
import { getWinners, sortPlayersByScore } from '../utils'

export default function Results() {
  const navigate = useNavigate()
  const { game, resetGame } = useGameStore()

  // Redirecionar se não há jogo finalizado
  useEffect(() => {
    if (!game || game.status !== 'finished') {
      navigate('/')
    }
  }, [game, navigate])

  if (!game || game.status !== 'finished') {
    return null
  }

  const winners = getWinners(game.players)
  const sortedPlayers = sortPlayersByScore(game.players)
  const isMultipleWinners = winners.length > 1

  const handleNewGame = () => {
    resetGame()
    navigate('/novo-jogo')
  }

  const handleHome = () => {
    resetGame()
    navigate('/')
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <PageContainer>
      <main className="flex-1 p-4 space-y-6 overflow-auto pb-24">
        {/* Header com troféu */}
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="font-display text-3xl font-bold text-gold mb-2">
            Fim de Jogo!
          </h1>
        </div>

        {/* Vencedor(es) */}
        <Card variant="elevated" className="text-center">
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-xl text-white/70 mb-2">
            {isMultipleWinners ? 'Vencedores' : 'Vencedor'}
          </h2>
          <div className="space-y-2">
            {winners.map(winner => (
              <div key={winner.id}>
                <p className="text-2xl font-bold text-gold">
                  {winner.name}
                </p>
                <p className="text-3xl font-mono font-bold text-white">
                  {winner.totalScore} pts
                </p>
              </div>
            ))}
          </div>
          {isMultipleWinners && (
            <p className="text-white/50 text-sm mt-3">Empate!</p>
          )}
        </Card>

        {/* Ranking final */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Ranking Final</h2>

          <div className="space-y-2">
            {sortedPlayers.map((player, index) => {
              const isWinner = winners.some(w => w.id === player.id)
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isWinner ? 'bg-gold/10 border border-gold/30' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8">{medal}</span>
                    <div>
                      <span className={`font-medium ${isWinner ? 'text-gold' : 'text-white'}`}>
                        {player.name}
                      </span>
                      <span className="text-white/50 text-sm ml-2">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-lg ${
                    isWinner ? 'text-gold' : 'text-white'
                  }`}>
                    {player.totalScore} pts
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Estatísticas */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Estatísticas</h2>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold text-gold">{game.totalRounds}</p>
              <p className="text-sm text-white/50">Rodadas</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold text-gold">{game.players.length}</p>
              <p className="text-sm text-white/50">Jogadores</p>
            </div>
          </div>

          <p className="text-center text-white/40 text-sm mt-4">
            {formatDate(game.finishedAt || game.createdAt)}
          </p>
        </Card>

        {/* Logo */}
        <div className="flex justify-center py-4">
          <Logo size="sm" />
        </div>
      </main>

      {/* Botões fixos */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-felt-dark via-felt-dark to-transparent">
        <div className="space-y-3">
          <Button
            fullWidth
            size="lg"
            onClick={handleNewGame}
          >
            Nova Partida
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={handleHome}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
