import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GameData {
  id: string
  players: {
    id: string
    name: string
    position: number
    totalScore: number
  }[]
  rounds: {
    number: number
    cardCount: number
    dealerId: string
    status: string
    players: {
      playerId: string
      estimate: number | null
      wins: number | null
      score: number | null
    }[]
  }[]
  currentRoundIndex: number
  totalRounds: number
  direction: string
}

interface InsightsHistoryEntry {
  roundNumber: number
  narrativeSummary: string
  keyMoments: string[]
  playerNicknames: Record<string, string>
}

function buildPrompt(gameData: GameData, history: InsightsHistoryEntry[] = []): string {
  const currentRound = gameData.rounds[gameData.currentRoundIndex]
  const roundsPlayed = gameData.rounds.filter(r => r.status === 'finished').length
  const roundsLeft = gameData.totalRounds - roundsPlayed
  const isFirstInsights = history.length === 0

  // Preparar dados resumidos para o prompt
  const playersSummary = gameData.players.map(p => {
    const playerRounds = gameData.rounds
      .filter(r => r.status === 'finished')
      .map(r => {
        const rp = r.players.find(rp => rp.playerId === p.id)
        return {
          round: r.number,
          cards: r.cardCount,
          estimate: rp?.estimate ?? 0,
          wins: rp?.wins ?? 0,
          score: rp?.score ?? 0,
          hit: rp?.estimate === rp?.wins,
        }
      })

    const hits = playerRounds.filter(r => r.hit).length
    const total = playerRounds.length
    const avgEstimate = total > 0 ? playerRounds.reduce((s, r) => s + r.estimate, 0) / total : 0
    const avgScore = total > 0 ? playerRounds.reduce((s, r) => s + r.score, 0) / total : 0

    // Detectar sequências
    let currentStreak = 0
    let streakType: 'hit' | 'miss' | null = null
    for (let i = playerRounds.length - 1; i >= 0; i--) {
      const isHit = playerRounds[i].hit
      if (streakType === null) {
        streakType = isHit ? 'hit' : 'miss'
        currentStreak = 1
      } else if ((isHit && streakType === 'hit') || (!isHit && streakType === 'miss')) {
        currentStreak++
      } else {
        break
      }
    }

    return {
      name: p.name,
      totalScore: p.totalScore,
      position: 0, // será calculado
      roundsData: playerRounds,
      stats: {
        hits,
        total,
        hitRate: total > 0 ? Math.round((hits / total) * 100) : 0,
        avgEstimate: Math.round(avgEstimate * 10) / 10,
        avgScore: Math.round(avgScore * 10) / 10,
        currentStreak,
        streakType,
      },
    }
  })

  // Ordenar por pontuação e atribuir posições
  playersSummary.sort((a, b) => b.totalScore - a.totalScore)
  playersSummary.forEach((p, i) => (p.position = i + 1))

  // Construir contexto do histórico
  let historyContext = ''
  if (history.length > 0) {
    // Extrair apelidos já usados (usar os mais recentes)
    const existingNicknames: Record<string, string> = {}
    history.forEach(h => {
      Object.entries(h.playerNicknames || {}).forEach(([name, nickname]) => {
        existingNicknames[name] = nickname
      })
    })

    historyContext = `
CONTEXTO NARRATIVO (MUITO IMPORTANTE - MANTENHA A CONTINUIDADE!):
Esta é uma continuação da narrativa. Você já fez análises anteriores desta partida.

APELIDOS JÁ ESTABELECIDOS (USE OS MESMOS!):
${Object.entries(existingNicknames).map(([name, nick]) => `- ${name}: "${nick}"`).join('\n')}

HISTÓRICO DA NARRATIVA:
${history.map(h => `
Rodada ${h.roundNumber}:
- Resumo: ${h.narrativeSummary}
- Momentos-chave: ${h.keyMoments.join('; ')}
`).join('\n')}

REGRAS DE CONTINUIDADE:
1. MANTENHA os apelidos já criados para cada jogador (não invente novos!)
2. Referencie eventos passados quando relevante ("como vimos na rodada X...")
3. Evolua a narrativa: se alguém estava em má fase e melhorou, destaque a virada
4. Se o líder mudou, comente a "troca de coroa"
5. Mantenha consistência: não contradiga análises anteriores sem justificativa
6. Construa arcos narrativos: vilões, heróis, azarões, etc.
`
  }

  return `Você é um narrador MUITO divertido e descontraído de uma partida do jogo de cartas "Estimativa".
${isFirstInsights ? 'Esta é a PRIMEIRA análise da partida - estabeleça os personagens e suas características!' : ''}

REGRAS DO TOM DE VOZ (IMPORTANTE!):
- Seja zoeiro mas respeitoso, como um grupo de amigos jogando
- Use emojis com moderação (1-2 por frase)
- Varie MUITO o estilo das frases - nunca use a mesma estrutura duas vezes
- Faça referências à cultura pop brasileira quando fizer sentido
- Seja criativo nos apelidos e comparações
- Use gírias brasileiras naturalmente (tipo "tá on fire", "mitou", "zerou", etc)
- Alterne entre análises sérias e zoeiras leves
${historyContext}
DADOS DA PARTIDA:
- Rodada atual: ${currentRound.number} de ${gameData.totalRounds}
- Rodadas jogadas: ${roundsPlayed}
- Rodadas restantes: ${roundsLeft}
- Cartas na rodada atual: ${currentRound.cardCount}
- Status da rodada: ${currentRound.status}

JOGADORES E ESTATÍSTICAS:
${JSON.stringify(playersSummary, null, 2)}

GERE UM JSON (apenas o JSON, sem markdown) com EXATAMENTE esta estrutura:

{
  "narrativeSummary": "resumo de 1 frase do momento atual da partida para contexto futuro",
  "momentum": [
    {
      "playerName": "nome",
      "type": "on_fire|bad_phase|comeback|consistent|volatile",
      "message": "frase criativa sobre o momento do jogador"
    }
  ],
  "race": {
    "summary": "frase empolgante sobre a disputa pelo título",
    "projections": [
      {
        "playerName": "nome",
        "currentScore": 0,
        "projectedScore": 0,
        "position": 1,
        "message": "análise curta e divertida"
      }
    ],
    "turnoverChance": "análise das chances de virada",
    "roundsLeft": ${roundsLeft}
  },
  "profiles": [
    {
      "playerName": "nome",
      "nickname": "${isFirstInsights ? 'apelido criativo baseado no estilo' : 'MANTENHA O APELIDO DO HISTÓRICO'}",
      "style": "conservador|agressivo|equilibrado|imprevisivel",
      "strengths": ["ponto forte 1"],
      "weaknesses": ["ponto fraco 1"],
      "funFact": "curiosidade sobre o desempenho"
    }
  ],
  "accuracy": {
    "byPlayer": [
      {
        "playerName": "nome",
        "overall": 75,
        "byRange": [
          {"range": "0", "percentage": 100, "total": 2, "hits": 2},
          {"range": "1-2", "percentage": 60, "total": 5, "hits": 3},
          {"range": "3+", "percentage": 33, "total": 3, "hits": 1}
        ]
      }
    ],
    "tips": ["dica zoeira para melhorar"]
  },
  "trends": [
    {
      "playerName": "nome",
      "type": "overestimate|underestimate|calibrated|early_game|late_game",
      "message": "observação sobre tendência",
      "value": 0.5
    }
  ],
  "highlights": [
    {
      "type": "best_round|worst_round|biggest_comeback|most_consistent|most_volatile|epic_moment",
      "playerName": "nome",
      "round": 3,
      "value": 50,
      "message": "descrição do momento"
    }
  ]
}

IMPORTANTE:
- Gere dados REAIS baseados nas estatísticas
- Seja CRIATIVO e varie as frases
- Use os nomes reais dos jogadores
- MENSAGENS CURTAS (máx 80 caracteres)
- Gere apenas 2-3 itens por categoria
- ${isFirstInsights ? 'Crie apelidos memoráveis para cada jogador' : 'USE OS MESMOS APELIDOS do histórico!'}
- Retorne APENAS o JSON válido`
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const { gameData, insightsHistory = [] } = await req.json()
    if (!gameData) {
      throw new Error('gameData is required')
    }

    console.log('Generating insights for round', gameData.currentRoundIndex + 1)
    console.log('History entries:', insightsHistory.length)

    const client = new Anthropic({ apiKey })

    const prompt = buildPrompt(gameData, insightsHistory)

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extrair o texto da resposta
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Tentar parsear o JSON
    let insights
    try {
      // Remover possíveis marcadores de código markdown
      let cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()

      // Encontrar o início e fim do JSON (primeiro { e último })
      const jsonStart = cleanJson.indexOf('{')
      const jsonEnd = cleanJson.lastIndexOf('}')

      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        throw new Error('No valid JSON object found in response')
      }

      cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1)

      insights = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText.substring(0, 500))
      console.error('Parse error:', parseError)
      throw new Error('Failed to parse AI response as JSON')
    }

    // Adicionar metadata
    insights.generatedAt = new Date().toISOString()
    insights.roundNumber = gameData.currentRoundIndex + 1

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate insights' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
