import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { PageContainer, Header } from '../components/layout'
import { useGameStore } from '../stores'
import { getRoundsInfo, getEstimateOrder, createPlayer } from '../utils'
import type { GameDirection } from '../types'

export default function NewGame() {
  const navigate = useNavigate()
  const { createGame, resetGame, game } = useGameStore()

  const [playerCount, setPlayerCount] = useState(4)
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', ''])
  const [firstDealer, setFirstDealer] = useState(1)
  const [direction, setDirection] = useState<GameDirection>('clockwise')

  // Atualizar array de nomes quando muda o número de jogadores
  useEffect(() => {
    setPlayerNames(prev => {
      const newNames = [...prev]
      while (newNames.length < playerCount) newNames.push('')
      return newNames.slice(0, playerCount)
    })
    // Resetar dealer se estiver fora do range
    if (firstDealer > playerCount) {
      setFirstDealer(1)
    }
  }, [playerCount, firstDealer])

  const roundsInfo = getRoundsInfo(playerCount)
  const allNamesFilled = playerNames.every(n => n.trim().length > 0)

  // Calcular preview da ordem de estimativa
  const getOrderPreview = () => {
    if (!allNamesFilled) return []
    const tempPlayers = playerNames.map((name, index) => createPlayer(name, index + 1))
    return getEstimateOrder(tempPlayers, firstDealer, direction)
  }

  const orderPreview = getOrderPreview()

  const handleStartGame = () => {
    if (!allNamesFilled) return

    // Se já existe um jogo, resetar primeiro
    if (game) {
      resetGame()
    }

    createGame(playerNames, firstDealer, direction)
    navigate('/jogo')
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <PageContainer>
      <Header
        title="Nova Partida"
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

      <main className="flex-1 p-4 space-y-6 overflow-auto">
        {/* Seletor de número de jogadores */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Quantos jogadores?</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className={`w-11 h-11 rounded-full font-medium text-lg transition-all ${
                  playerCount === n
                    ? 'bg-gold text-felt-dark shadow-chip scale-110'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Info das rodadas */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-center">
            <p className="text-sm text-white/70">
              <span className="text-gold font-bold text-lg">{roundsInfo.total}</span> rodadas
              {' • '}
              máx <span className="text-gold font-bold">{roundsInfo.maxCards}</span> cartas
            </p>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
              {roundsInfo.sequence.join(' → ')}
            </p>
          </div>
        </Card>

        {/* Nomes dos jogadores */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Jogadores</h2>
          <p className="text-sm text-white/50 mb-4">
            Informe os nomes na ordem da mesa (sentido horário)
          </p>

          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <Input
                    placeholder={`Nome do jogador ${index + 1}`}
                    value={name}
                    onChange={(e) => {
                      const newNames = [...playerNames]
                      newNames[index] = e.target.value
                      setPlayerNames(newNames)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Primeiro dealer */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Quem dá as cartas primeiro?</h2>
          <div className="flex flex-wrap gap-2">
            {playerNames.map((name, index) => (
              <button
                key={index}
                onClick={() => setFirstDealer(index + 1)}
                disabled={!name.trim()}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  firstDealer === index + 1
                    ? 'bg-gold text-felt-dark'
                    : name.trim()
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                {name.trim() || `Jogador ${index + 1}`}
              </button>
            ))}
          </div>
        </Card>

        {/* Sentido do jogo */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Sentido do jogo</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setDirection('clockwise')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                direction === 'clockwise'
                  ? 'bg-gold/20 border-2 border-gold'
                  : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${direction === 'clockwise' ? 'text-gold' : 'text-white/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className={`font-medium ${direction === 'clockwise' ? 'text-gold' : 'text-white/70'}`}>
                Horário
              </span>
            </button>

            <button
              onClick={() => setDirection('counterclockwise')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                direction === 'counterclockwise'
                  ? 'bg-gold/20 border-2 border-gold'
                  : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transform scale-x-[-1] ${direction === 'counterclockwise' ? 'text-gold' : 'text-white/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className={`font-medium ${direction === 'counterclockwise' ? 'text-gold' : 'text-white/70'}`}>
                Anti-horário
              </span>
            </button>
          </div>

          {/* Preview da ordem */}
          {allNamesFilled && orderPreview.length > 0 && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 mb-2">Ordem de estimativa:</p>
              <p className="text-sm text-white/80">
                {orderPreview.map(p => p.name).join(' → ')}
              </p>
            </div>
          )}
        </Card>

        {/* Espaço para o botão fixo */}
        <div className="h-20" />
      </main>

      {/* Botão fixo no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-felt-dark via-felt-dark to-transparent">
        <Button
          fullWidth
          size="lg"
          onClick={handleStartGame}
          disabled={!allNamesFilled}
        >
          Iniciar Partida
        </Button>
      </div>
    </PageContainer>
  )
}
