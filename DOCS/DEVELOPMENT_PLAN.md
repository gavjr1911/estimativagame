# Plano de Desenvolvimento - Estimativa

## Visão Geral

Este documento define as etapas de desenvolvimento do MVP do aplicativo Estimativa.
O desenvolvimento está organizado em fases incrementais, permitindo entregas parciais funcionais.

---

## Fase 1: Fundação do Projeto ✅ CONCLUÍDA

### 1.1 Setup Inicial
- [x] Inicializar projeto com Vite + React + TypeScript
- [x] Configurar Tailwind CSS v4
- [x] Configurar ESLint + Prettier
- [x] Configurar estrutura de pastas conforme ARCHITECTURE.md
- [x] Criar arquivo .gitignore
- [x] Inicializar repositório Git

### 1.2 Configuração PWA
- [x] Instalar e configurar vite-plugin-pwa
- [x] Criar manifest.json (via vite config)
- [x] Configurar service worker básico
- [ ] Criar ícones do app (placeholder inicial) - *pendente*

### 1.3 Design System Base
- [x] Configurar cores no Tailwind (paleta do jogo)
- [x] Configurar fontes (Playfair Display, Inter, Roboto Mono)
- [x] Criar componente Button (estilo ficha de poker)
- [x] Criar componente Card (container com sombra)
- [x] Criar componente Input (estilizado)
- [x] Criar componente NumberSelector (chips)
- [x] Criar componente Counter (+/-)
- [x] Criar textura de fundo (feltro verde via CSS)
- [x] Criar componentes de layout (PageContainer, Header)

**Entregável:** Projeto configurado com componentes base funcionando. ✅

---

## Fase 2: Lógica do Jogo (Core) ✅ CONCLUÍDA

### 2.1 Types e Interfaces
- [x] Definir interface Player
- [x] Definir interface Round
- [x] Definir interface RoundPlayer
- [x] Definir interface Game
- [x] Definir interface GameHistory
- [x] Definir interface ScoreResult

### 2.2 Funções Utilitárias
- [x] Implementar `calculateMaxCards(playerCount)`
- [x] Implementar `generateRoundSequence(playerCount)`
- [x] Implementar `calculateScore(estimate, wins)`
- [x] Implementar `getEstimateOrder(players, dealerPosition)`
- [x] Implementar `getNextDealer(players, currentDealerId)`
- [x] Implementar funções auxiliares (createPlayer, createGame, etc.)
- [ ] Criar testes unitários para cada função - *pendente*

### 2.3 Zustand Stores
- [x] Criar gameStore com estado inicial e persistência
- [x] Implementar action: createGame
- [x] Implementar action: setEstimate
- [x] Implementar action: confirmEstimates
- [x] Implementar action: setWins
- [x] Implementar action: finishRound
- [x] Implementar action: nextRound
- [x] Implementar action: finishGame
- [x] Implementar action: resetGame
- [x] Implementar getters: getCurrentRound, getDealer, getEstimateOrder
- [x] Criar historyStore com persistência

**Entregável:** Lógica do jogo completa e testada, sem UI. ✅

---

## Fase 3: Telas Principais ✅ CONCLUÍDA

### 3.1 Layout Base
- [x] Criar componente PageContainer (fundo feltro)
- [x] Criar componente Header
- [x] Configurar React Router

### 3.2 Tela Home
- [x] Criar página Home
- [x] Implementar botão "Nova Partida"
- [x] Implementar botão "Continuar" (condicional)
- [x] Implementar botão "Histórico"
- [x] Implementar botão "Regras"
- [x] Integrar logomarca oficial

### 3.3 Tela Nova Partida
- [x] Criar página NewGame
- [x] Implementar seletor de número de jogadores
- [x] Implementar campos de nome dinâmicos
- [x] Implementar seletor de dealer inicial
- [x] Implementar preview de rodadas
- [x] Implementar validação de formulário
- [x] Implementar botão "Iniciar Partida"
- [x] Conectar com gameStore.createGame

**Entregável:** Fluxo de criar nova partida funcionando. ✅

---

## Fase 4: Tela do Jogo ✅ CONCLUÍDA

### 4.1 Componentes do Jogo
- [x] Criar componente RoundHeader (rodada atual, cartas, dealer)
- [x] Criar componente NumberSelector (chips 0-N) - *já existia*
- [x] Criar componente Counter (+/-) - *já existia*
- [x] Criar componente ScoreBoard (placar)

### 4.2 Fase de Estimativas
- [x] Criar view EstimatesPhase
- [x] Listar jogadores na ordem correta
- [x] Destacar jogador atual
- [x] Implementar seleção de estimativa
- [x] Permitir edição antes de confirmar
- [x] Implementar botão "Confirmar Estimativas"
- [x] Validar: todos estimaram

### 4.3 Fase de Resultados
- [x] Criar view ResultsPhase
- [x] Mostrar estimativa de cada jogador
- [x] Implementar contador de vitórias
- [x] Validar: soma vitórias = cartas
- [x] Implementar botão "Calcular Pontos"

### 4.4 Resumo da Rodada
- [x] Criar view RoundSummary
- [x] Mostrar resultado individual (acerto/erro)
- [x] Mostrar pontos ganhos/perdidos
- [x] Mostrar placar atualizado
- [x] Implementar botão "Próxima Rodada"

### 4.5 Integração
- [x] Criar página Game que gerencia as 3 fases
- [x] Conectar tudo com gameStore

**Entregável:** Fluxo completo de uma rodada funcionando. ✅

---

## Fase 5: Finalização e Persistência ✅ CONCLUÍDA

### 5.1 Tela de Resultado Final
- [x] Criar página Results
- [x] Mostrar vencedor(es) com destaque
- [x] Mostrar ranking final
- [x] Mostrar estatísticas da partida
- [x] Implementar botão "Nova Partida"
- [x] Implementar botão "Voltar ao Início"

### 5.2 Persistência
- [x] Configurar zustand/persist para gameStore
- [x] Implementar auto-save do jogo em andamento
- [x] Implementar recuperação ao abrir app (via localStorage)
- [x] Implementar historyStore com persistência (localStorage)

### 5.3 Tela de Histórico
- [x] Criar página History
- [x] Listar partidas anteriores
- [x] Mostrar resumo de cada partida
- [x] Implementar opção de limpar histórico

### 5.4 Tela de Regras
- [x] Criar página Rules
- [x] Exibir regras formatadas (baseado em GAME_RULES.md)

**Entregável:** App completo com persistência funcionando. ✅

---

## Fase 6: Polimento

### 6.1 Design e Animações
- [ ] Refinar texturas (feltro, madeira)
- [ ] Adicionar micro-animações (transições)
- [ ] Implementar feedback visual (loading, sucesso, erro)
- [ ] Implementar sons opcionais
- [ ] Criar ícones finais do PWA

### 6.2 UX Improvements
- [ ] Adicionar confirmação para abandonar partida
- [ ] Melhorar feedback de erros
- [ ] Otimizar para diferentes tamanhos de tela
- [ ] Testar e ajustar fluxos

### 6.3 Performance
- [ ] Implementar lazy loading de rotas
- [ ] Otimizar bundle size
- [ ] Testar offline mode
- [ ] Lighthouse audit e correções

### 6.4 Testes
- [ ] Testes unitários das funções core
- [ ] Testes de integração dos stores
- [ ] Testes E2E do fluxo principal

**Entregável:** MVP pronto para uso.

---

## Checklist de Validação Final

### Funcionalidades Core
- [ ] Criar partida com 2-10 jogadores
- [ ] Cálculo correto de rodadas
- [ ] Fluxo de estimativas funciona
- [ ] Fluxo de resultados funciona
- [ ] Cálculo de pontuação correto
- [ ] Rotação de dealer funciona
- [ ] Placar atualiza corretamente
- [ ] Partida finaliza corretamente

### Persistência
- [ ] Partida salva automaticamente
- [ ] Partida retoma após fechar app
- [ ] Histórico é mantido
- [ ] Funciona offline

### UX
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Interface intuitiva
- [ ] Feedback visual claro
- [ ] Não há erros/bugs aparentes

### Técnico
- [ ] PWA instalável
- [ ] Service worker funcionando
- [ ] Sem erros no console
- [ ] Performance aceitável

---

## Notas de Implementação

### Prioridades
1. **Core primeiro:** Lógica antes de UI bonita
2. **Mobile-first:** Foco em experiência mobile
3. **Funcional > Bonito:** Primeiro funciona, depois polir

### Decisões Técnicas
- Usar React Router para navegação
- Zustand com middleware persist
- Tailwind para estilização
- Vitest para testes

### Riscos Identificados
- Complexidade do cálculo de rodadas → Mitigado com testes
- Persistência offline → Testar em diferentes navegadores
- Performance em dispositivos antigos → Manter bundle leve
