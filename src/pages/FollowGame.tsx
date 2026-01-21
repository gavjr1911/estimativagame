import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore, useSyncStore } from '../stores'
import { useRealtimeGame, type EndReason } from '../hooks'
import { useGameInsights } from '../hooks/useGameInsights'
import { PageContainer, Header } from '../components/layout'
import { SyncBar } from '../components/sync'
import RoundHeader from '../components/follow/RoundHeader'
import LiveRanking from '../components/follow/LiveRanking'
import RoundDetails from '../components/follow/RoundDetails'
import RoundHistory from '../components/follow/RoundHistory'
import {
  InsightMomentum,
  InsightRace,
  InsightProfiles,
  InsightAccuracy,
  InsightTrends,
  InsightHighlights,
} from '../components/follow/insights'

/**
 * Página de acompanhamento do jogo para viewers
 */
export default function FollowGame() {
  const navigate = useNavigate()
  const { game, resetGame } = useGameStore()
  const { role, status } = useSyncStore()
  const { reconnect, endReason, clearEndReason } = useRealtimeGame()

  // Estado para mostrar modal de encerramento
  const [showEndModal, setShowEndModal] = useState<EndReason>(null)

  // Hook de insights
  const {
    insights,
    isLoading: insightsLoading,
    error: insightsError,
    refresh: refreshInsights,
    canGenerate,
  } = useGameInsights(game)

  // Se não há jogo ou não é viewer, redirecionar
  useEffect(() => {
    // Se não tem jogo e não está mostrando modal de encerramento, voltar para home
    if (!game && !showEndModal) {
      navigate('/')
      return
    }

    // Se é host, redirecionar para a página de jogo normal
    if (role === 'host') {
      navigate('/jogo')
      return
    }
  }, [game, role, navigate, showEndModal])

  // Tratar fim do jogo pelo host
  useEffect(() => {
    if (endReason) {
      console.log('[FollowGame] Game ended by host:', endReason)
      setShowEndModal(endReason)
      clearEndReason()
    }
  }, [endReason, clearEndReason])

  // Tratar desconexão (viewer foi desconectado sem motivo claro)
  useEffect(() => {
    if (status === 'disconnected' && role === 'none' && !showEndModal) {
      // Se ficou desconectado e sem role, provavelmente o jogo acabou
      navigate('/')
    }
  }, [status, role, showEndModal, navigate])

  // Função para sair após ver o modal
  const handleExitGame = () => {
    setShowEndModal(null)
    resetGame()
    navigate('/')
  }

  // Modal de encerramento do jogo
  if (showEndModal) {
    const isInterrupted = showEndModal === 'game_interrupted'

    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center border border-white/10 shadow-xl">
            <div className="text-5xl mb-4">
              {isInterrupted ? '🛑' : '👋'}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {isInterrupted ? 'Jogo Encerrado' : 'Transmissão Encerrada'}
            </h2>
            <p className="text-white/70 mb-6">
              {isInterrupted
                ? 'O host interrompeu a partida.'
                : 'O host parou de compartilhar o jogo.'}
            </p>
            <button
              onClick={handleExitGame}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!game) {
    return null
  }

  const currentRound = game.rounds[game.currentRoundIndex]
  const dealer = game.players.find(p => p.id === currentRound.dealerId)

  if (!currentRound || !dealer) {
    return null
  }

  // Verificar se o jogo terminou
  const isGameFinished = game.status === 'finished'

  return (
    <PageContainer>
      {/* Header */}
      <Header
        title="Acompanhando"
        rightAction={
          canGenerate ? (
            <button
              onClick={() => refreshInsights()}
              disabled={insightsLoading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              title="Atualizar insights"
            >
              <svg
                className={`w-5 h-5 text-white ${insightsLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          ) : undefined
        }
      />

      {/* Barra de sincronização */}
      <SyncBar onReconnect={reconnect} />

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-8">
          {/* Banner de jogo finalizado */}
          {isGameFinished && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-yellow-400 mt-2">
                Jogo Finalizado!
              </h2>
              <p className="text-white/70 mt-1">
                Confira o resultado final abaixo
              </p>
            </div>
          )}

          {/* Cabeçalho da rodada */}
          <RoundHeader
            game={game}
            currentRound={currentRound}
            dealer={dealer}
          />

          {/* Ranking ao vivo */}
          <LiveRanking game={game} currentRound={currentRound} />

          {/* Detalhes da rodada atual */}
          <RoundDetails game={game} currentRound={currentRound} />

          {/* Histórico de rodadas */}
          <RoundHistory game={game} />

          {/* Seção de Insights */}
          {canGenerate && (
            <div className="space-y-3">
              {/* Divisor */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/50 text-sm font-medium flex items-center gap-2">
                  <span>📊</span>
                  Análises & Insights
                  {insightsLoading && (
                    <span className="text-xs text-white/30">(gerando...)</span>
                  )}
                </span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Erro de insights */}
              {insightsError && !insights && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                  <p className="text-red-400 text-sm">{insightsError}</p>
                  <button
                    onClick={() => refreshInsights()}
                    className="mt-2 text-sm text-white/70 hover:text-white underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Loading inicial */}
              {insightsLoading && !insights && (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                  <div className="animate-pulse">
                    <div className="text-3xl mb-3">🤖</div>
                    <p className="text-white/70">Gerando análises com IA...</p>
                    <p className="text-white/40 text-sm mt-1">
                      Isso pode levar alguns segundos
                    </p>
                  </div>
                </div>
              )}

              {/* Insights */}
              {insights && (
                <>
                  <InsightMomentum insights={insights.momentum} />
                  <InsightRace insight={insights.race} />
                  <InsightProfiles profiles={insights.profiles} />
                  <InsightAccuracy insight={insights.accuracy} />
                  <InsightTrends trends={insights.trends} />
                  <InsightHighlights highlights={insights.highlights} />
                </>
              )}
            </div>
          )}

          {/* Mensagem quando não há insights disponíveis */}
          {!canGenerate && (
            <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
              <span className="text-2xl">📊</span>
              <p className="text-white/70 mt-2">
                Análises e insights estarão disponíveis após a primeira rodada
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
