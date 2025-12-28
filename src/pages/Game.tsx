import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, NumberSelector, Counter } from '../components/ui'
import { PageContainer, Header } from '../components/layout'
import { useGameStore } from '../stores'

export default function Game() {
  const navigate = useNavigate()
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

  const isLastRound = game.currentRoundIndex === game.totalRounds - 1

  return (
    <PageContainer>
      {/* Header com info da rodada */}
      <Header
        title={`Rodada ${round.number}/${game.totalRounds}`}
        rightAction={
          <span className="text-gold font-mono font-bold">
            {round.cardCount} cartas
          </span>
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
    </PageContainer>
  )
}
