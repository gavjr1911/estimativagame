import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, NumberSelector, Counter, Modal } from '../components/ui'
import { PageContainer, Header } from '../components/layout'
import { ShareModal, SyncBar, ViewerBadge } from '../components/sync'
import { useGameStore, useSyncStore } from '../stores'
import { useRealtimeGame, useSupabaseStatus } from '../hooks'
import type { EndReason } from '../hooks/useRealtimeGame'

export default function Game() {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEndedModal, setShowEndedModal] = useState<EndReason>(null)

  const { role, leaveGame } = useSyncStore()
  const { isConfigured } = useSupabaseStatus()
  const isViewer = role === 'viewer'
  const isHost = role === 'host'

  // Ativar realtime sync
  const { endReason, clearEndReason, reconnect } = useRealtimeGame()

  // Detectar quando o host encerra o jogo ou para o compartilhamento
  useEffect(() => {
    if (endReason) {
      setShowEndedModal(endReason)
    }
  }, [endReason])

  const {
    game,
    getCurrentRound,
    getDealer,
    getEstimateOrder,
    setEstimate,
    confirmEstimates,
    backToEstimates,
    setWins,
    finishRound,
    nextRound,
    finishGame,
    resetGame,
    canConfirmEstimates,
    canFinishRound,
    getWinsValidation,
  } = useGameStore()

  const round = getCurrentRound()
  const dealer = getDealer()
  const estimateOrder = getEstimateOrder()

  // Redirecionar se não há jogo
  useEffect(() => {
    if (!game) {
      navigate('/')
    }
  }, [game, navigate])

  if (!game || !round || !dealer) {
    return null
  }

  const { isValid: winsValid, difference: winsDifference } = getWinsValidation()

  // Encontrar dados do jogador na rodada
  const getPlayerRoundData = (playerId: string) => {
    return round.players.find(p => p.playerId === playerId)
  }

  const handleNextRound = () => {
    if (game.currentRoundIndex < game.totalRounds - 1) {
      nextRound()
    } else {
      finishGame()
      navigate('/resultado')
    }
  }

  const handleDeleteGame = async () => {
    // Se está compartilhando, notificar viewers que o jogo foi encerrado
    if (isHost) {
      await leaveGame()
    }
    resetGame()
    navigate('/')
  }

  const isLastRound = game.currentRoundIndex === game.totalRounds - 1

  return (
    <PageContainer>
      {/* Header com info da rodada e engrenagem */}
      <Header
        title={`Rodada ${round.number}/${game.totalRounds}`}
        rightAction={
          <button
            onClick={() => setShowSettings(true)}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        }
      />

      {/* Barra de sincronização */}
      {isConfigured && (isHost || isViewer) && (
        <SyncBar onReconnect={reconnect} />
      )}

      {/* Banner de modo visualização (apenas quando NÃO está sincronizando) */}
      {isViewer && !isConfigured && <ViewerBadge />}

      <main className="flex-1 p-4 space-y-4 overflow-auto pb-24">
        {/* Info do Dealer e Cartas */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-white/70 text-sm">Dealer:</span>
            <span className="text-gold font-medium text-sm">{dealer.name}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-gold font-bold text-sm">{round.cardCount} cartas</span>
          </div>
        </div>

        {/* FASE: ESTIMATIVAS */}
        {round.status === 'estimating' && (
          <>
            <Card variant="elevated">
              <h2 className="text-lg font-semibold text-white mb-1">Estimativas</h2>
              <p className="text-sm text-white/50 mb-4">
                Cada jogador informa quantas rodadas espera ganhar
              </p>

              <div className="space-y-4">
                {estimateOrder.map((player, index) => {
                  const roundData = getPlayerRoundData(player.id)
                  const hasEstimate = roundData?.estimate !== null

                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg transition-all ${
                        hasEstimate ? 'bg-white/5' : 'bg-gold/10 border border-gold/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-xs">
                            {index + 1}
                          </span>
                          <span className="font-medium text-white">
                            {player.name}
                          </span>
                          {player.id === dealer.id && (
                            <span className="text-xs text-gold/70">(dealer)</span>
                          )}
                        </div>
                        <span className="text-white/50 text-sm font-mono">
                          {player.totalScore} pts
                        </span>
                      </div>

                      <NumberSelector
                        max={round.cardCount}
                        value={roundData?.estimate ?? null}
                        onChange={(value) => setEstimate(player.id, value)}
                        disabled={isViewer}
                      />
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Botão confirmar */}
            {!isViewer && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-felt-dark via-felt-dark to-transparent">
                <Button
                  fullWidth
                  size="lg"
                  onClick={confirmEstimates}
                  disabled={!canConfirmEstimates()}
                >
                  Confirmar Estimativas
                </Button>
              </div>
            )}
          </>
        )}

        {/* FASE: JOGANDO (registrar vitórias) */}
        {round.status === 'playing' && (
          <>
            <Card variant="elevated">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-white">Resultados</h2>
                {!isViewer && (
                  <button
                    onClick={backToEstimates}
                    className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar Estimativas
                  </button>
                )}
              </div>
              <p className="text-sm text-white/50 mb-4">
                Informe quantas rodadas cada jogador ganhou
              </p>

              <div className="space-y-4">
                {estimateOrder.map(player => {
                  const roundData = getPlayerRoundData(player.id)

                  return (
                    <div
                      key={player.id}
                      className="p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-white">
                          {player.name}
                        </span>
                        <span className="text-sm text-white/50">
                          Estimou: <span className="text-gold font-mono">{roundData?.estimate}</span>
                        </span>
                      </div>

                      <Counter
                        value={roundData?.wins ?? 0}
                        max={round.cardCount}
                        onChange={(value) => setWins(player.id, value)}
                        label="Vitórias"
                        disabled={isViewer}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Validação da soma */}
              <div className={`mt-4 p-3 rounded-lg text-center ${
                winsValid
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <p className={`text-sm ${winsValid ? 'text-green-400' : 'text-red-400'}`}>
                  {winsValid ? (
                    'Soma das vitórias está correta!'
                  ) : (
                    <>
                      {winsDifference > 0 ? `${winsDifference} vitória(s) a mais` : `${Math.abs(winsDifference)} vitória(s) faltando`}
                      <span className="text-white/50"> (total deve ser {round.cardCount})</span>
                    </>
                  )}
                </p>
              </div>
            </Card>

            {/* Botão calcular pontos */}
            {!isViewer && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-felt-dark via-felt-dark to-transparent">
                <Button
                  fullWidth
                  size="lg"
                  onClick={finishRound}
                  disabled={!canFinishRound()}
                >
                  Calcular Pontos
                </Button>
              </div>
            )}
          </>
        )}

        {/* FASE: RESUMO DA RODADA */}
        {round.status === 'finished' && (
          <>
            <Card variant="elevated">
              <h2 className="text-lg font-semibold text-white mb-4">Resultado da Rodada</h2>

              <div className="space-y-3">
                {game.players.map(player => {
                  const roundData = getPlayerRoundData(player.id)
                  const score = roundData?.score ?? 0
                  const isHit = roundData?.estimate === roundData?.wins
                  const isZeroHit = isHit && roundData?.wins === 0

                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg ${
                        isHit ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-white">
                            {isHit ? (isZeroHit ? '⭐' : '🏆') : '😢'} {player.name}
                          </span>
                          <p className="text-sm text-white/50">
                            Estimou {roundData?.estimate}, ganhou {roundData?.wins}
                          </p>
                        </div>
                        <span className={`text-xl font-bold font-mono ${
                          score >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {score >= 0 ? '+' : ''}{score}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Placar Geral */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Placar Geral</h2>

              <div className="space-y-2">
                {[...game.players]
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-gold text-felt-dark' : 'bg-white/10 text-white/70'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-white">{player.name}</span>
                      </div>
                      <span className="font-mono font-bold text-gold">
                        {player.totalScore} pts
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Botão próxima rodada */}
            {!isViewer && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-felt-dark via-felt-dark to-transparent">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleNextRound}
                >
                  {isLastRound ? 'Ver Resultado Final' : 'Próxima Rodada →'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Configurações */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Configurações"
      >
        <div className="space-y-3">
          {/* Botão de compartilhar (apenas host e quando Supabase configurado) */}
          {isConfigured && !isViewer && (
            <button
              onClick={() => {
                setShowSettings(false)
                setShowShareModal(true)
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="font-medium">Compartilhar Partida</span>
            </button>
          )}

          {/* Botão sair da partida (viewer) */}
          {isViewer && (
            <button
              onClick={async () => {
                await leaveGame()
                navigate('/')
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sair da Partida</span>
            </button>
          )}

          {/* Botão interromper (host) */}
          {!isViewer && (
            <button
              onClick={() => {
                setShowSettings(false)
                setShowConfirmDelete(true)
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="font-medium">Interromper Partida</span>
            </button>
          )}

          <button
            onClick={() => setShowSettings(false)}
            className="w-full p-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Interromper Partida?"
      >
        <p className="text-white/70 mb-6">
          Tem certeza que deseja interromper a partida atual? Esta ação não pode ser desfeita e todos os dados serão perdidos.
        </p>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowConfirmDelete(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleDeleteGame}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Interromper
          </Button>
        </div>
      </Modal>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Modal de Transmissão Encerrada (para viewers) */}
      <Modal
        isOpen={showEndedModal !== null}
        onClose={() => {
          setShowEndedModal(null)
          clearEndReason()
        }}
        title={showEndedModal === 'game_interrupted' ? 'Partida Interrompida' : 'Transmissão Encerrada'}
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            {showEndedModal === 'game_interrupted' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            )}
          </div>

          {showEndedModal === 'game_interrupted' ? (
            <>
              <p className="text-white/70 mb-2">
                O anfitrião interrompeu a partida
              </p>
              <p className="text-sm text-white/50 mb-6">
                A partida foi encerrada e não pode mais ser continuada.
              </p>
              <Button
                fullWidth
                onClick={() => {
                  setShowEndedModal(null)
                  clearEndReason()
                  resetGame()
                  navigate('/')
                }}
              >
                Voltar ao Início
              </Button>
            </>
          ) : (
            <>
              <p className="text-white/70 mb-2">
                O anfitrião parou o compartilhamento
              </p>
              <p className="text-sm text-white/50 mb-6">
                Você não receberá mais atualizações, mas pode continuar a partida no seu dispositivo.
              </p>
              <div className="space-y-3">
                <Button
                  fullWidth
                  onClick={() => {
                    setShowEndedModal(null)
                    clearEndReason()
                  }}
                >
                  Continuar no Meu Dispositivo
                </Button>
                <button
                  onClick={() => {
                    setShowEndedModal(null)
                    clearEndReason()
                    resetGame()
                    navigate('/')
                  }}
                  className="w-full py-2 text-white/50 hover:text-white text-sm transition-colors"
                >
                  Encerrar e Voltar ao Início
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </PageContainer>
  )
}
