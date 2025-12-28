# Arquitetura Técnica - Estimativa

## 1. Visão Geral

### 1.1 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Framework** | React 18+ | Ecossistema maduro, grande comunidade |
| **Linguagem** | TypeScript | Type-safety, melhor DX, menos bugs |
| **Estilização** | Tailwind CSS | Utility-first, produtividade, bundle otimizado |
| **Estado** | Zustand | Leve, simples, sem boilerplate |
| **Persistência** | localStorage + IndexedDB | Offline-first, sem backend |
| **PWA** | Vite PWA Plugin | Service worker, instalável |
| **Build** | Vite | Rápido, moderno, ótimo DX |
| **Testes** | Vitest + Testing Library | Integrado com Vite |

### 1.2 Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                      PWA Shell                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │ Components  │  │   Hooks     │     │
│  │             │  │             │  │             │     │
│  │ - Home      │  │ - Header    │  │ - useGame   │     │
│  │ - NewGame   │  │ - Placar    │  │ - useRound  │     │
│  │ - Game      │  │ - Player    │  │ - useScore  │     │
│  │ - History   │  │ - Round     │  │ - useStore  │     │
│  │ - Results   │  │ - Input     │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 Zustand Store                     │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐  │  │
│  │  │ gameStore  │ │ uiStore    │ │ historyStore │  │  │
│  │  └────────────┘ └────────────┘ └──────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                           │                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Persistence Layer                    │  │
│  │         localStorage / IndexedDB                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Pastas

```
src/
├── assets/              # Imagens, ícones, sons
│   ├── images/
│   └── sounds/
├── components/          # Componentes React reutilizáveis
│   ├── ui/              # Componentes base (Button, Input, Card)
│   ├── game/            # Componentes específicos do jogo
│   └── layout/          # Header, Footer, Layout
├── hooks/               # Custom hooks
│   ├── useGame.ts
│   ├── useRound.ts
│   ├── useScore.ts
│   └── usePersistence.ts
├── pages/               # Páginas/Telas do app
│   ├── Home.tsx
│   ├── NewGame.tsx
│   ├── Game.tsx
│   ├── History.tsx
│   └── Results.tsx
├── stores/              # Zustand stores
│   ├── gameStore.ts
│   ├── uiStore.ts
│   └── historyStore.ts
├── types/               # TypeScript types/interfaces
│   ├── game.ts
│   ├── player.ts
│   └── round.ts
├── utils/               # Funções utilitárias
│   ├── scoring.ts       # Cálculo de pontuação
│   ├── rounds.ts        # Cálculo de rodadas
│   └── storage.ts       # Persistência
├── styles/              # Estilos globais
│   └── globals.css
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 3. Modelos de Dados

### 3.1 Player
```typescript
interface Player {
  id: string;
  name: string;
  position: number;        // 1-10, posição na mesa
  totalScore: number;      // Pontuação acumulada
}
```

### 3.2 RoundPlayer (dados do jogador em uma rodada)
```typescript
interface RoundPlayer {
  playerId: string;
  estimate: number | null; // Estimativa (null = ainda não informou)
  wins: number | null;     // Vitórias (null = rodada não finalizada)
  score: number | null;    // Pontos da rodada
}
```

### 3.3 Round
```typescript
interface Round {
  number: number;          // Número da rodada (1, 2, 3...)
  cardCount: number;       // Quantidade de cartas
  dealerId: string;        // ID do dealer
  status: 'estimating' | 'playing' | 'finished';
  players: RoundPlayer[];
}
```

### 3.4 Game
```typescript
interface Game {
  id: string;
  createdAt: Date;
  finishedAt: Date | null;
  status: 'setup' | 'in_progress' | 'finished';
  players: Player[];
  rounds: Round[];
  currentRoundIndex: number;
  totalRounds: number;
  roundSequence: number[]; // [2, 4, 6, 8, 7, 5, 3, 1]
}
```

### 3.5 GameHistory
```typescript
interface GameHistory {
  id: string;
  date: Date;
  players: {
    name: string;
    finalScore: number;
    position: number;      // Ranking final
  }[];
  winner: string;          // Nome do vencedor
  totalRounds: number;
}
```

---

## 4. Stores (Zustand)

### 4.1 Game Store
```typescript
interface GameStore {
  // Estado
  game: Game | null;

  // Ações - Setup
  createGame: (playerNames: string[], firstDealerIndex: number) => void;

  // Ações - Rodada
  setEstimate: (playerId: string, estimate: number) => void;
  confirmEstimates: () => void;
  setWins: (playerId: string, wins: number) => void;
  finishRound: () => void;
  nextRound: () => void;

  // Ações - Jogo
  finishGame: () => void;
  resetGame: () => void;

  // Computed
  getCurrentRound: () => Round | null;
  getDealer: () => Player | null;
  getEstimateOrder: () => Player[];
  canFinishRound: () => boolean;
}
```

### 4.2 History Store
```typescript
interface HistoryStore {
  history: GameHistory[];

  addGame: (game: Game) => void;
  getHistory: () => GameHistory[];
  getGameById: (id: string) => GameHistory | null;
  clearHistory: () => void;
}
```

### 4.3 UI Store
```typescript
interface UIStore {
  isLoading: boolean;
  activeModal: string | null;

  setLoading: (loading: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}
```

---

## 5. Funções Utilitárias Principais

### 5.1 Cálculo de Rodadas
```typescript
// utils/rounds.ts

function calculateMaxCards(playerCount: number): number {
  return Math.floor(51 / playerCount);
}

function generateRoundSequence(playerCount: number): number[] {
  const max = calculateMaxCards(playerCount);
  const ascending: number[] = [];
  const descending: number[] = [];

  // Subindo (pares): 2, 4, 6...
  for (let i = 2; i <= max; i += 2) {
    ascending.push(i);
  }

  // Descendo (ímpares): max ou max-1, max-2 ou max-3...
  const startDesc = max % 2 === 0 ? max - 1 : max;
  for (let i = startDesc; i >= 1; i -= 2) {
    descending.push(i);
  }

  return [...ascending, ...descending];
}
```

### 5.2 Cálculo de Pontuação
```typescript
// utils/scoring.ts

function calculateScore(estimate: number, wins: number): number {
  if (estimate === wins) {
    return wins === 0 ? 5 : 10 * wins;
  }
  return -10 * Math.abs(estimate - wins);
}
```

### 5.3 Ordem de Estimativa
```typescript
// utils/game.ts

function getEstimateOrder(
  players: Player[],
  dealerPosition: number
): Player[] {
  const sorted = [...players].sort((a, b) => a.position - b.position);
  const dealerIndex = sorted.findIndex(p => p.position === dealerPosition);

  // Começa pela direita do dealer (posição anterior)
  const startIndex = (dealerIndex - 1 + sorted.length) % sorted.length;

  const order: Player[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const index = (startIndex - i + sorted.length) % sorted.length;
    order.push(sorted[index]);
  }

  return order;
}
```

---

## 6. Persistência

### 6.1 Estratégia
- **Jogo em andamento:** localStorage (acesso rápido, síncrono)
- **Histórico de partidas:** IndexedDB (maior capacidade)

### 6.2 Middleware Zustand
```typescript
// Persist automático para localStorage
import { persist } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({
      // ... store
    }),
    {
      name: 'estimativa-game',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 6.3 Keys de Storage
```
localStorage:
  - estimativa-game      # Jogo em andamento
  - estimativa-ui        # Estado da UI

IndexedDB:
  - estimativa-db
    └── games            # Histórico de partidas
```

---

## 7. PWA Configuration

### 7.1 Manifest
```json
{
  "name": "Estimativa",
  "short_name": "Estimativa",
  "description": "Placar digital para o jogo de cartas Estimativa",
  "theme_color": "#1a5f2a",
  "background_color": "#0d3018",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [...]
}
```

### 7.2 Service Worker
- Cache de assets estáticos
- Funcionamento offline completo
- Atualização em background

---

## 8. Preparação para Futuro (Multiplayer)

### 8.1 Abstração de Comunicação
```typescript
// Preparar interface para futuro
interface GameCommunication {
  broadcastEstimate: (playerId: string, estimate: number) => void;
  broadcastWins: (playerId: string, wins: number) => void;
  onPlayerUpdate: (callback: (data: any) => void) => void;
}

// MVP: implementação local (no-op)
// Futuro: WebSocket/Supabase real-time
```

### 8.2 Separação de Concerns
- Lógica de negócio isolada em utils/hooks
- Store agnóstico de fonte de dados
- Fácil substituir localStorage por API

---

## 9. Performance

### 9.1 Otimizações
- Code splitting por rota (lazy loading)
- Memoização de componentes pesados
- Debounce em inputs
- Virtual list para histórico grande

### 9.2 Bundle Target
- Bundle inicial < 100KB (gzipped)
- TTI < 2 segundos em 3G
