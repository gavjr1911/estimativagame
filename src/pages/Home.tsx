import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { PageContainer, Header } from '../components/layout'
import { useGameStore } from '../stores'

export default function Home() {
  const navigate = useNavigate()
  const { game } = useGameStore()

  const hasGameInProgress = game && game.status === 'in_progress'

  return (
    <PageContainer>
      <Header showLogo />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Botões de ação */}
        <div className="w-full max-w-xs space-y-4 animate-fade-in">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/novo-jogo')}
          >
            Nova Partida
          </Button>

          {hasGameInProgress && (
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={() => navigate('/jogo')}
            >
              Continuar
            </Button>
          )}

          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate('/historico')}
          >
            Histórico
          </Button>

          <Button
            fullWidth
            variant="ghost"
            onClick={() => navigate('/regras')}
          >
            Regras do Jogo
          </Button>
        </div>

        {/* Info do jogo em andamento */}
        {hasGameInProgress && (
          <div className="mt-8 text-center text-white/50 text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p>Partida em andamento</p>
            <p className="text-white/70">
              Rodada {game.currentRoundIndex + 1} de {game.totalRounds}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-white/30 text-xs">
        Estimativa v1.0
      </footer>
    </PageContainer>
  )
}
