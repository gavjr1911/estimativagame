import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui'
import { PageContainer, Header } from '../components/layout'

export default function Rules() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/')
  }

  return (
    <PageContainer>
      <Header
        title="Regras do Jogo"
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

      <main className="flex-1 p-4 space-y-4 overflow-auto pb-8">
        {/* Visão Geral */}
        <Card>
          <h2 className="text-lg font-semibold text-gold mb-3">O que é Estimativa?</h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Estimativa é um jogo de cartas onde os jogadores devem prever quantas rodadas irão vencer.
            A habilidade está em avaliar corretamente a força da sua mão e acertar a estimativa.
          </p>
        </Card>

        {/* Materiais */}
        <Card>
          <h2 className="text-lg font-semibold text-gold mb-3">Materiais</h2>
          <ul className="text-white/80 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>Baralho de 52 cartas (sem coringas)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>2 a 10 jogadores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>Este app para controle de pontuação</span>
            </li>
          </ul>
        </Card>

        {/* Hierarquia das Cartas */}
        <Card>
          <h2 className="text-lg font-semibold text-gold mb-3">Força das Cartas</h2>
          <p className="text-white/80 text-sm mb-3">Da menor para a maior:</p>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="font-mono text-white tracking-wider">
              2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K → A
            </p>
          </div>
          <div className="mt-3 p-3 bg-gold/10 rounded-lg border border-gold/30">
            <p className="text-sm text-gold font-medium">Naipe Curinga (Trunfo)</p>
            <p className="text-white/70 text-sm mt-1">
              No início de cada rodada, uma carta é virada do baralho. O naipe dessa carta se torna o
              naipe curinga e vence qualquer carta de outros naipes.
            </p>
          </div>
        </Card>

        {/* Fluxo da Rodada */}
        <Card>
          <h2 className="text-lg font-semibold text-gold mb-3">Fluxo de uma Rodada</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold text-felt-dark text-sm font-bold shrink-0">1</span>
              <div>
                <p className="text-white font-medium">Preparação</p>
                <p className="text-white/60 text-sm">O dealer distribui as cartas e vira uma para definir o naipe curinga.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold text-felt-dark text-sm font-bold shrink-0">2</span>
              <div>
                <p className="text-white font-medium">Estimativas</p>
                <p className="text-white/60 text-sm">Começando pela direita do dealer, cada jogador diz quantas rodadas espera ganhar.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold text-felt-dark text-sm font-bold shrink-0">3</span>
              <div>
                <p className="text-white font-medium">Jogo</p>
                <p className="text-white/60 text-sm">Jogadores jogam suas cartas. Deve-se seguir o naipe jogado ou usar curinga.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold text-felt-dark text-sm font-bold shrink-0">4</span>
              <div>
                <p className="text-white font-medium">Pontuação</p>
                <p className="text-white/60 text-sm">Pontos são calculados comparando estimativas com vitórias.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Pontuação */}
        <Card>
          <h2 className="text-lg font-semibold text-gold mb-3">Sistema de Pontuação</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div>
                <p className="text-green-400 font-medium">Acertou na mosca</p>
                <p className="text-white/60 text-sm">Estimou X, ganhou X</p>
              </div>
              <span className="text-green-400 font-mono font-bold">+10 × X</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gold/10 rounded-lg border border-gold/30">
              <div>
                <p className="text-gold font-medium">Zero certeiro</p>
                <p className="text-white/60 text-sm">Estimou 0, ganhou 0</p>
              </div>
              <span className="text-gold font-mono font-bold">+5</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <div>
                <p className="text-red-400 font-medium">Errou</p>
                <p className="text-white/60 text-sm">Diferença entre estimativa e vitórias</p>
              </div>
              <span className="text-red-400 font-mono font-bold">-10 × diff</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-white/70 text-sm font-medium mb-2">Exemplos:</p>
            <div className="space-y-1 text-sm">
              <p className="text-white/60">Estimou 3, ganhou 3 → <span className="text-green-400">+30 pts</span></p>
              <p className="text-white/60">Estimou 0, ganhou 0 → <span className="text-gold">+5 pts</span></p>
              <p className="text-white/60">Estimou 5, ganhou 3 → <span className="text-red-400">-20 pts</span></p>
            </div>
          </div>
        </Card>

        {/* Rodadas */}
        <Card>
          <h2 className="text-lg font-semibold text-gold mb-3">Estrutura das Rodadas</h2>
          <p className="text-white/80 text-sm leading-relaxed mb-3">
            O jogo tem rodadas com quantidade crescente e depois decrescente de cartas:
          </p>
          <ul className="text-white/70 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-gold">↑</span>
              <span><strong>Subindo (pares):</strong> 2, 4, 6, 8... até o máximo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">↓</span>
              <span><strong>Descendo (ímpares):</strong> max-1, max-3... até 1</span>
            </li>
          </ul>
          <p className="text-white/50 text-xs mt-3">
            O máximo de cartas depende do número de jogadores (52 cartas ÷ jogadores - 1 para o curinga), limitado a 12 cartas.
          </p>
        </Card>

        {/* Dicas */}
        <Card>
          <h2 className="text-lg font-semibold text-gold mb-3">Dicas Estratégicas</h2>
          <ul className="text-white/70 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span>💡</span>
              <span>Cartas altas do naipe curinga são praticamente vitórias garantidas</span>
            </li>
            <li className="flex items-start gap-2">
              <span>💡</span>
              <span>Ases de outros naipes são fortes, mas podem perder para curingas</span>
            </li>
            <li className="flex items-start gap-2">
              <span>💡</span>
              <span>Estimar zero é arriscado, mas rende pontos seguros (+5)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>💡</span>
              <span>Observe as estimativas dos outros para ajustar sua estratégia</span>
            </li>
          </ul>
        </Card>
      </main>
    </PageContainer>
  )
}
