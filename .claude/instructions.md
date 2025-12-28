# Instruções do Projeto - Estimativa

## Sobre o Projeto

Este é o **Estimativa**, um placar digital PWA para o jogo de cartas de mesmo nome.
**Importante:** Não estamos construindo o jogo, apenas o controle de pontuação.

## Documentação

Antes de desenvolver, consulte a documentação em `/DOCS`:

- **PRD.md** - Requisitos do produto e funcionalidades
- **GAME_RULES.md** - Regras detalhadas do jogo
- **ARCHITECTURE.md** - Arquitetura técnica e modelos de dados
- **UI_UX.md** - Design, telas e fluxos
- **DEVELOPMENT_PLAN.md** - Plano de desenvolvimento com todas as tarefas

## Regras Críticas do Negócio

### Cálculo de Rodadas
```
max_cartas = floor(51 / num_jogadores)

Sequência:
- Subindo (pares): 2, 4, 6, 8... até max par
- Descendo (ímpares): max-1, max-3... até 1
```

### Pontuação
```
Acertou estimativa: +10 × vitórias
Estimou 0, ganhou 0: +5 pontos
Errou: -10 × |estimativa - vitórias|
```

### Ordem de Estimativa
- Começa pelo jogador à DIREITA do dealer
- Segue no sentido ANTI-HORÁRIO
- Dealer estima por último

### Rotação de Dealer
- Quem estimou primeiro na rodada anterior vira o dealer

## Stack Tecnológica

- React 18 + TypeScript + Vite
- Tailwind CSS (skeumorfismo: feltro verde, fichas de poker)
- Zustand (estado)
- PWA com vite-plugin-pwa
- localStorage + IndexedDB (persistência)

## Convenções de Código

- Componentes: PascalCase (`PlayerCard.tsx`)
- Hooks: camelCase com `use` (`useGame.ts`)
- Stores: camelCase com `Store` (`gameStore.ts`)
- Tipos: PascalCase, preferir `interface`
- Idioma: Interface em Português BR

## Ao Desenvolver

1. Consulte DEVELOPMENT_PLAN.md para ver as tarefas
2. Marque tarefas concluídas conforme avança
3. Teste o cálculo de pontuação com casos diversos
4. Mantenha foco no MVP - sem over-engineering
5. Mobile-first sempre
