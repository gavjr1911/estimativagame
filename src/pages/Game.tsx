import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, NumberSelector, Counter, Modal } from '../components/ui'
import { PageContainer, Header } from '../components/layout'
import { useGameStore } from '../stores'

export default function Game() {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const {
    game,
    getCurrentRound,
    getDealer,
    getEstimateOrder,
    setEstimate,
    confirmEstimates,
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

  const handleDeleteGame = () => {
    resetGame()
    navigate('/')
  }

  const isLastRound = game.currentRoundIndex === game.totalRounds - 1

  return (
    <PageContainer>
      {/* Header com info da rodada e engrenagem */}
      <Header
        title={`Rodada ${round.number}/${game.totalRounds}`}
        leftAction={
          <span className="text-gold font-mono font-bold text-sm">
            {round.cardCount}
          </span>
        }
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

      <main className="flex-1 p-4 space-y-4 overflow-auto pb-24">
        {/* Info do Dealer */}
        <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
          <span>Dealer:</span>
          <span className="text-gold font-medium">{dealer.name}</span>
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
                      />
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Botão confirmar */}
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
          </>
        )}

        {/* FASE: JOGANDO (registrar vitórias) */}
        {round.status === 'playing' && (
          <>
            <Card variant="elevated">
              <h2 className="text-lg font-semibold text-white mb-1">Resultados</h2>
              <p className="text-sm text-white/50 mb-4">
                Informe quantas rodadas cada jogador ganhou
              </p>

              <div className="space-y-4">
                {game.players.map(player => {
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
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-felt-dark via-felt-dark to-transparent">
              <Button
                fullWidth
                size="lg"
                onClick={handleNextRound}
              >
                {isLastRound ? 'Ver Resultado Final' : 'Próxima Rodada →'}
              </Button>
            </div>
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
    </PageContainer>
  )
}
