import { useNavigate } from 'react-router-dom'
import { Button, Card, Logo } from '../components/ui'
import { PageContainer, Header } from '../components/layout'
import { useHistoryStore } from '../stores'

export default function History() {
  const navigate = useNavigate()
  const { history, clearHistory } = useHistoryStore()

  const handleBack = () => {
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
      <Header
        title="Histórico"
        leftAction={
          <button
            onClick={handleBack}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }
      />

      <main className="flex-1 p-4 space-y-4 overflow-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Logo size="md" className="opacity-50 mb-6" />
            <p className="text-white/50 text-lg mb-2">Nenhuma partida registrada</p>
            <p className="text-white/30 text-sm mb-6">
              Suas partidas finalizadas aparecerão aqui
            </p>
            <Button onClick={() => navigate('/novo-jogo')}>
              Iniciar Partida
            </Button>
          </div>
        ) : (
          <>
            {history.map(game => (
              <Card key={game.id} className="hover:bg-felt-dark/90 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white/50 text-sm">
                      {formatDate(game.date)}
                    </p>
                    <p className="text-white text-lg font-medium mt-1">
                      🏆 {game.winners.join(' & ')}
                    </p>
                  </div>
                  <span className="text-gold font-mono font-bold">
                    {game.players[0]?.finalScore} pts
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>{game.playerCount} jogadores</span>
                  <span>•</span>
                  <span>{game.totalRounds} rodadas</span>
                </div>

                {/* Lista de jogadores */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {game.players.map((player, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          player.position === 1
                            ? 'bg-gold/20 text-gold'
                            : 'bg-white/5 text-white/50'
                        }`}
                      >
                        {player.position}º {player.name}: {player.finalScore}pts
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            {/* Botão limpar histórico */}
            {history.length > 0 && (
              <div className="pt-4">
                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                      clearHistory()
                    }
                  }}
                >
                  Limpar Histórico
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </PageContainer>
  )
}
