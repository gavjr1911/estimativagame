import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Logo } from '../components/ui'
import { PageContainer } from '../components/layout'
import { JoinModal } from '../components/sync'
import { useGameStore } from '../stores'
import { useSupabaseStatus } from '../hooks'

export default function Home() {
  const navigate = useNavigate()
  const { game } = useGameStore()
  const { isConfigured, isOnline } = useSupabaseStatus()
  const [showJoinModal, setShowJoinModal] = useState(false)

  const hasGameInProgress = game && game.status === 'in_progress'
  const canJoinOnline = isConfigured && isOnline

  return (
    <PageContainer>
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-12 animate-fade-in">
          <Logo size="xl" showSubtitle />
        </div>

        {/* Botões de ação */}
        <div className="w-full max-w-xs space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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

          {/* Botão para entrar em partida online */}
          {canJoinOnline && (
            <div className="pt-4 border-t border-white/10 mt-4">
              <Button
                fullWidth
                variant="secondary"
                onClick={() => setShowJoinModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Entrar em Partida
              </Button>
            </div>
          )}
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

      {/* Modal para entrar em partida */}
      <JoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </PageContainer>
  )
}
