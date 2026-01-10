# Plano de Implementação: Multi-Dispositivo com Supabase

## Visão Geral

Permitir que múltiplos dispositivos acompanhem o mesmo jogo em tempo real via código de 6 caracteres.

### Decisões de Design

| Item | Decisão |
|------|---------|
| **Backend** | Supabase (PostgreSQL + Realtime) |
| **Frontend Hosting** | Vercel (já em uso) |
| **Autenticação** | Sessões anônimas (apenas nome) |
| **Permissões** | Host edita, viewers apenas visualizam |
| **Offline** | Funciona como hoje (localStorage) |
| **Expiração** | 3 horas sem atividade |
| **Histórico** | Salvo localmente em cada dispositivo |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISPOSITIVOS (Frontend)                       │
├───────────────────┬───────────────────┬─────────────────────────┤
│   Host Device     │   Viewer Device   │   Viewer Device         │
│   (pode editar)   │   (só leitura)    │   (só leitura)          │
│                   │                   │                         │
│   gameStore ←→ syncStore ←──────────────────────────────────────┤
│       ↓               ↓                       ↓                 │
│   localStorage    Supabase SDK        Supabase SDK              │
└───────────────────┴───────────────────┴─────────────────────────┘
                            │
                    Supabase Realtime
                            │
              ┌─────────────▼─────────────┐
              │      SUPABASE CLOUD       │
              │  ┌─────────────────────┐  │
              │  │    PostgreSQL       │  │
              │  │  - shared_games     │  │
              │  └─────────────────────┘  │
              │  ┌─────────────────────┐  │
              │  │  Realtime Engine    │  │
              │  │  (WebSocket)        │  │
              │  └─────────────────────┘  │
              │  ┌─────────────────────┐  │
              │  │  Edge Functions     │  │
              │  │  (cleanup cron)     │  │
              │  └─────────────────────┘  │
              └───────────────────────────┘
```

---

## Modelo de Dados

### Tabela: `shared_games`

```sql
CREATE TABLE shared_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_device_id VARCHAR(64) NOT NULL,
  game_data JSONB NOT NULL,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- Índices
CREATE INDEX idx_shared_games_code ON shared_games(code);
CREATE INDEX idx_shared_games_status ON shared_games(status);
CREATE INDEX idx_shared_games_updated_at ON shared_games(updated_at);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shared_games_updated_at
  BEFORE UPDATE ON shared_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS)

```sql
ALTER TABLE shared_games ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler jogos ativos
CREATE POLICY "read_active_games" ON shared_games
  FOR SELECT
  USING (status = 'active');

-- Qualquer um pode criar (insert)
CREATE POLICY "insert_games" ON shared_games
  FOR INSERT
  WITH CHECK (true);

-- Apenas host pode atualizar (via header customizado)
CREATE POLICY "update_own_games" ON shared_games
  FOR UPDATE
  USING (true);  -- Validação feita no frontend por simplicidade
```

---

## Estrutura de Arquivos (Novos)

```
src/
├── lib/
│   └── supabase.ts              # Cliente Supabase configurado
│
├── stores/
│   └── syncStore.ts             # Estado de sincronização
│
├── types/
│   └── sync.ts                  # Tipos para sincronização
│
├── utils/
│   └── sync.ts                  # Funções utilitárias de sync
│
├── hooks/
│   └── useRealtimeGame.ts       # Hook para subscription
│
├── components/
│   └── sync/
│       ├── ShareModal.tsx       # Modal para compartilhar
│       ├── JoinModal.tsx        # Modal para entrar
│       ├── SyncStatus.tsx       # Indicador de conexão
│       └── ViewerBadge.tsx      # Badge "Visualizando"
│
└── pages/
    └── Join.tsx                 # Página para entrar via código
```

---

## Fases de Implementação

### Fase 1: Setup Supabase (30 min)

**Tarefas:**
1. Criar projeto no Supabase (supabase.com)
2. Criar tabela `shared_games` via SQL Editor
3. Configurar RLS policies
4. Copiar credenciais (URL + anon key)
5. Instalar SDK: `npm install @supabase/supabase-js`
6. Criar `src/lib/supabase.ts` com cliente configurado
7. Adicionar variáveis de ambiente no `.env`

**Arquivos:**
- `src/lib/supabase.ts`
- `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- `.env.example`

**Validação:**
- Console do Supabase mostra tabela criada
- Build passa sem erros

---

### Fase 2: Tipos e Utilitários (20 min)

**Tarefas:**
1. Criar tipos TypeScript para sync
2. Criar função para gerar código de 6 chars
3. Criar função para gerar device ID único
4. Criar funções CRUD para shared_games

**Arquivos:**
- `src/types/sync.ts`
- `src/utils/sync.ts`

**Tipos principais:**
```typescript
// src/types/sync.ts
export type SyncRole = 'host' | 'viewer' | 'none'
export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface SharedGame {
  id: string
  code: string
  host_device_id: string
  game_data: Game
  viewer_count: number
  created_at: string
  updated_at: string
  status: 'active' | 'finished' | 'expired'
}

export interface SyncState {
  // Estado
  role: SyncRole
  status: SyncStatus
  code: string | null
  error: string | null
  viewerCount: number

  // Actions
  shareGame: () => Promise<string>
  joinGame: (code: string) => Promise<boolean>
  leaveGame: () => void
  syncGameState: (game: Game) => Promise<void>
}
```

**Validação:**
- TypeScript compila sem erros

---

### Fase 3: syncStore (45 min)

**Tarefas:**
1. Criar store Zustand para sync
2. Implementar `shareGame()` - cria registro no Supabase
3. Implementar `joinGame()` - busca por código
4. Implementar `leaveGame()` - cleanup
5. Implementar `syncGameState()` - atualiza Supabase
6. Gerar/persistir deviceId único

**Arquivo:**
- `src/stores/syncStore.ts`

**Fluxo shareGame:**
```
1. Gerar código único (6 chars)
2. Verificar se código já existe
3. Inserir no Supabase
4. Retornar código
5. Iniciar subscription
```

**Fluxo joinGame:**
```
1. Buscar jogo por código
2. Se não existe → erro
3. Se existe → carregar game_data no gameStore
4. Iniciar subscription
5. Marcar role como 'viewer'
```

**Validação:**
- Console mostra insert/select funcionando
- Código gerado é único

---

### Fase 4: Hook useRealtimeGame (30 min)

**Tarefas:**
1. Criar hook para Supabase Realtime subscription
2. Escutar mudanças na tabela `shared_games`
3. Filtrar por código do jogo atual
4. Atualizar gameStore quando receber update
5. Tratar reconexão automática

**Arquivo:**
- `src/hooks/useRealtimeGame.ts`

**Implementação:**
```typescript
export function useRealtimeGame() {
  const { code, role } = useSyncStore()
  const { game } = useGameStore()

  useEffect(() => {
    if (!code) return

    const channel = supabase
      .channel(`game:${code}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'shared_games',
        filter: `code=eq.${code}`
      }, (payload) => {
        if (role === 'viewer') {
          // Atualizar gameStore com novos dados
          useGameStore.setState({ game: payload.new.game_data })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [code, role])
}
```

**Validação:**
- Viewer recebe atualizações quando host muda algo

---

### Fase 5: Integração com gameStore (30 min)

**Tarefas:**
1. Modificar actions do gameStore para sincronizar
2. Após cada mudança de estado, chamar `syncGameState()`
3. Apenas sincronizar se `role === 'host'`
4. Não sincronizar se offline

**Arquivo modificado:**
- `src/stores/gameStore.ts`

**Estratégia:**
```typescript
// Wrapper para sincronização
const syncAfterAction = (action: () => void) => {
  action()
  const { role, syncGameState } = useSyncStore.getState()
  const { game } = get()
  if (role === 'host' && game) {
    syncGameState(game)
  }
}

// Exemplo de uso:
setEstimate: (playerId, estimate) => {
  syncAfterAction(() => {
    // ... lógica atual
  })
}
```

**Validação:**
- Mudanças do host aparecem no viewer em <1 segundo

---

### Fase 6: UI - ShareModal (30 min)

**Tarefas:**
1. Criar modal para compartilhar jogo
2. Mostrar código grande e copiável
3. Botão "Copiar código"
4. Mostrar número de viewers conectados
5. Botão "Parar compartilhamento"

**Arquivo:**
- `src/components/sync/ShareModal.tsx`

**Design:**
```
┌────────────────────────────────┐
│     Compartilhar Partida       │
├────────────────────────────────┤
│                                │
│         ABC123                 │  ← Código grande
│                                │
│    [Copiar Código]             │
│                                │
│    2 pessoas assistindo        │
│                                │
│  [Parar Compartilhamento]      │
│                                │
└────────────────────────────────┘
```

**Validação:**
- Modal abre/fecha corretamente
- Código é copiado para clipboard

---

### Fase 7: UI - JoinModal e Página Join (30 min)

**Tarefas:**
1. Criar modal para entrar em jogo
2. Input para código de 6 caracteres
3. Validação em tempo real
4. Criar página `/entrar` para acesso direto
5. Auto-maiúsculo no input

**Arquivos:**
- `src/components/sync/JoinModal.tsx`
- `src/pages/Join.tsx`

**Design:**
```
┌────────────────────────────────┐
│      Entrar em Partida         │
├────────────────────────────────┤
│                                │
│  Código da partida:            │
│  ┌────────────────────────┐    │
│  │      ABC123            │    │
│  └────────────────────────┘    │
│                                │
│        [Entrar]                │
│                                │
│  ou [Criar Nova Partida]       │
│                                │
└────────────────────────────────┘
```

**Validação:**
- Código inválido mostra erro
- Código válido redireciona para jogo

---

### Fase 8: UI - SyncStatus e ViewerBadge (20 min)

**Tarefas:**
1. Criar indicador de status de conexão
2. Criar badge para modo viewer
3. Integrar no header da página Game

**Arquivos:**
- `src/components/sync/SyncStatus.tsx`
- `src/components/sync/ViewerBadge.tsx`

**Estados visuais:**
- 🟢 Conectado (host/viewer)
- 🟡 Conectando...
- 🔴 Desconectado
- 👁️ "Visualizando" (viewer mode)

**Validação:**
- Status muda conforme conexão
- Viewer vê badge claramente

---

### Fase 9: Integração na Home e Game (30 min)

**Tarefas:**
1. Adicionar botão "Entrar em Partida" na Home
2. Adicionar botão "Compartilhar" no menu de configurações do Game
3. Mostrar SyncStatus no header quando compartilhando
4. Desabilitar edição para viewers
5. Aplicar useRealtimeGame nas páginas

**Arquivos modificados:**
- `src/pages/Home.tsx`
- `src/pages/Game.tsx`

**Validação:**
- Fluxo completo funciona end-to-end

---

### Fase 10: Cleanup e Expiração (20 min)

**Tarefas:**
1. Criar Edge Function no Supabase para cleanup
2. Deletar jogos com `updated_at` > 3 horas
3. Configurar cron job (a cada 30 min)
4. Marcar jogos finalizados como 'finished'

**Arquivo:**
- Supabase Dashboard > Edge Functions

**SQL para cleanup manual:**
```sql
DELETE FROM shared_games
WHERE updated_at < NOW() - INTERVAL '3 hours'
  AND status = 'active';
```

**Cron no Supabase:**
```sql
SELECT cron.schedule(
  'cleanup-expired-games',
  '*/30 * * * *',  -- A cada 30 minutos
  $$
  DELETE FROM shared_games
  WHERE updated_at < NOW() - INTERVAL '3 hours'
    AND status = 'active';
  $$
);
```

**Validação:**
- Jogos antigos são removidos automaticamente

---

### Fase 11: Testes e Polish (30 min)

**Tarefas:**
1. Testar fluxo completo host → viewer
2. Testar reconexão após perda de internet
3. Testar múltiplos viewers simultâneos
4. Testar expiração de jogos
5. Ajustar UX conforme necessário
6. Adicionar loading states
7. Tratar erros de rede graciosamente

**Cenários de teste:**
- [ ] Host cria jogo → compartilha → viewer entra
- [ ] Host faz mudança → viewer vê em tempo real
- [ ] Viewer tenta editar → não consegue
- [ ] Host fecha app → viewer vê desconectado
- [ ] Internet cai → reconecta automaticamente
- [ ] Código inválido → mensagem de erro
- [ ] Jogo finalizado → não pode mais entrar

---

## Checklist de Variáveis de Ambiente

```env
# .env.local (não commitar)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```env
# .env.example (commitar)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Vercel:**
- Adicionar variáveis em Project Settings > Environment Variables

---

## Estimativa de Tempo

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | Setup Supabase | 30 min |
| 2 | Tipos e Utilitários | 20 min |
| 3 | syncStore | 45 min |
| 4 | useRealtimeGame | 30 min |
| 5 | Integração gameStore | 30 min |
| 6 | ShareModal | 30 min |
| 7 | JoinModal + Página | 30 min |
| 8 | SyncStatus + Badge | 20 min |
| 9 | Integração Home/Game | 30 min |
| 10 | Cleanup/Expiração | 20 min |
| 11 | Testes e Polish | 30 min |
| **Total** | | **~5 horas** |

---

## Possíveis Gaps Identificados

### 1. ✅ Conflito de Estado
**Problema:** Se host e viewer tentarem editar ao mesmo tempo
**Solução:** Viewers não podem editar (já definido)

### 2. ✅ Reconexão
**Problema:** Perda de conexão WebSocket
**Solução:** Supabase SDK reconecta automaticamente

### 3. ⚠️ Rate Limiting
**Problema:** Muitas atualizações por segundo podem exceder limites
**Solução:** Debounce de 500ms nas sincronizações

### 4. ⚠️ Tamanho do Payload
**Problema:** `game_data` pode ficar grande com muitas rodadas
**Solução:** Jogo com 10 players, 12 rodadas ≈ 50KB (OK para Supabase)

### 5. ⚠️ Device ID Persistência
**Problema:** Se usuário limpar localStorage, perde device ID
**Solução:** Gerar novo ID (será tratado como novo dispositivo)

### 6. ⚠️ Código Duplicado
**Problema:** Dois jogos podem gerar mesmo código (colisão)
**Solução:** Verificar existência antes de inserir + retry

### 7. ⚠️ Viewer Offline
**Problema:** Viewer perde conexão e não sabe estado atual
**Solução:** Mostrar banner "Reconectando..." + último estado conhecido

### 8. ✅ Jogo Finalizado
**Problema:** O que acontece quando jogo termina?
**Solução:** Marcar como 'finished', viewers veem resultado final

### 9. ⚠️ Múltiplas Abas
**Problema:** Host abre jogo em duas abas
**Solução:** Detectar e avisar "Jogo aberto em outra aba"

### 10. ✅ Fallback Offline
**Problema:** Sem internet, compartilhamento não funciona
**Solução:** Botão desabilitado + mensagem "Sem conexão"

---

## Próximos Passos

1. Confirmar plano está completo
2. Criar projeto no Supabase
3. Começar implementação fase a fase
4. Testar incrementalmente

---

## Futuras Melhorias (v2)

- [ ] QR Code para facilitar entrada
- [ ] Cada jogador pode lançar sua própria estimativa
- [ ] Notificações push quando é sua vez
- [ ] Histórico compartilhado na nuvem
- [ ] Ranking global entre amigos
