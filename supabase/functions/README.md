# Supabase Edge Functions

## generate-insights

Esta função gera insights inteligentes sobre a partida usando a API do Claude (Anthropic).

### Configuração

1. **Instalar Supabase CLI** (se ainda não tiver):
```bash
npm install -g supabase
```

2. **Login no Supabase**:
```bash
supabase login
```

3. **Linkar o projeto**:
```bash
supabase link --project-ref <seu-project-ref>
```

4. **Configurar a API Key do Claude**:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

5. **Deploy da função**:
```bash
supabase functions deploy generate-insights
```

### Testar localmente

1. Criar arquivo `.env.local` na pasta `supabase/functions`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

2. Rodar localmente:
```bash
supabase functions serve generate-insights --env-file ./supabase/functions/.env.local
```

### Uso

A função recebe um POST com o estado do jogo e retorna insights gerados por AI:

```typescript
const { data, error } = await supabase.functions.invoke('generate-insights', {
  body: { gameData: game },
})
```

### Custos estimados

- Modelo: Claude 3.5 Haiku
- Custo médio por chamada: ~$0.001-0.002
- Custo estimado por partida completa: ~$0.02-0.04
