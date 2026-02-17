import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PlayerData {
  name: string
  score: number
  pos: number
  hits: number
  total: number
  hitRate: number
  streak: number
  streakType: 'hit' | 'miss' | null
}

interface GameData {
  id: string
  players: { id: string; name: string; totalScore: number }[]
  rounds: {
    number: number
    cardCount: number
    status: string
    players: { playerId: string; estimate: number | null; wins: number | null }[]
  }[]
  currentRoundIndex: number
  totalRounds: number
}

interface InsightsHistoryEntry {
  roundNumber: number
  narrativeSummary: string
  keyMoments: string[]
  playerNicknames: Record<string, string>
}

function buildCompactData(gameData: GameData): PlayerData[] {
  const finishedRounds = gameData.rounds.filter(r => r.status === 'finished')

  const players = gameData.players.map(p => {
    let hits = 0, total = 0, streak = 0
    let streakType: 'hit' | 'miss' | null = null

    // Iterar de trás pra frente para calcular streak das rodadas mais recentes
    for (let i = finishedRounds.length - 1; i >= 0; i--) {
      const r = finishedRounds[i]
      const rp = r.players.find(rp => rp.playerId === p.id)
      if (rp && rp.estimate !== null && rp.wins !== null) {
        total++
        const isHit = rp.estimate === rp.wins
        if (isHit) hits++

        if (streakType === null) {
          // Primeira rodada (mais recente): inicializa streak
          streakType = isHit ? 'hit' : 'miss'
          streak = 1
        } else if ((isHit && streakType === 'hit') || (!isHit && streakType === 'miss')) {
          // Continua a mesma streak
          streak++
        }
        // Se a streak quebrou, não precisa continuar contando streak
        // (mas continua contando hits/total)
      }
    }

    return {
      name: p.name,
      score: p.totalScore,
      pos: 0,
      hits,
      total,
      hitRate: total > 0 ? Math.round((hits / total) * 100) : 0,
      streak,
      streakType,
    }
  })

  // Ordenar e atribuir posições
  players.sort((a, b) => b.score - a.score)
  players.forEach((p, i) => p.pos = i + 1)

  return players
}

function buildPrompt(gameData: GameData, history: InsightsHistoryEntry[] = []): string {
  const roundsPlayed = gameData.rounds.filter(r => r.status === 'finished').length
  const roundsLeft = gameData.totalRounds - roundsPlayed
  const isFirst = history.length === 0
  const players = buildCompactData(gameData)
  const numPlayers = players.length

  // Dados compactos: nome|score|pos|hits/total|hitRate%|streak
  const playersCompact = players.map(p =>
    `${p.name}|${p.score}pts|#${p.pos}|${p.hits}/${p.total}|${p.hitRate}%|${p.streak}${p.streakType === 'hit' ? 'W' : 'L'}`
  ).join('\n')

  // Contexto do histórico (compacto)
  let historyCtx = ''
  if (history.length > 0) {
    const nicks = history.reduce((acc, h) => ({ ...acc, ...h.playerNicknames }), {} as Record<string, string>)
    const nicksStr = Object.entries(nicks).map(([n, a]) => `${n}="${a}"`).join(', ')
    const histStr = history.map(h => `R${h.roundNumber}: ${h.narrativeSummary}`).join(' | ')

    historyCtx = `
APELIDOS: ${nicksStr}
HISTÓRICO: ${histStr}
REGRA: Use os mesmos apelidos! Evolua a narrativa.`
  }

  return `Narrador zoeiro de "Estimativa" (jogo de cartas BR).
Tom: amigos jogando, gírias BR, emojis moderados, frases curtas (<60 chars).
${isFirst ? 'PRIMEIRA análise - crie apelidos memoráveis!' : ''}
${historyCtx}

PARTIDA: Rodada ${roundsPlayed}/${gameData.totalRounds}, ${roundsLeft} restantes
JOGADORES (nome|score|pos|acertos|taxa|sequência):
${playersCompact}

Retorne JSON (sem markdown):
{
"narrativeSummary":"resumo 1 frase",
"momentum":[{"playerName":"","type":"on_fire|bad_phase|comeback|consistent|volatile","message":""}],
"race":{"summary":"","projections":[{"playerName":"","currentScore":0,"projectedScore":0,"position":1,"message":""}],"turnoverChance":"","roundsLeft":${roundsLeft}},
"profiles":[${players.map(() => '{"playerName":"","nickname":"","style":"conservador|agressivo|equilibrado|imprevisivel","strengths":[""],"weaknesses":[""],"funFact":""}').join(',')}],
"trends":[{"playerName":"","type":"overestimate|underestimate|calibrated","message":"","value":0}],
"highlights":[{"type":"best_round|worst_round|comeback|epic_moment","playerName":"","round":0,"value":0,"message":""}]
}

REGRAS:
- ${numPlayers} perfis obrigatórios (1 por jogador)
- 2-3 itens em momentum/trends/highlights
- Mensagens <60 chars
- JSON válido apenas`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

    const { gameData, insightsHistory = [] } = await req.json()
    if (!gameData) throw new Error('gameData is required')

    const client = new Anthropic({ apiKey })
    const prompt = buildPrompt(gameData, insightsHistory)

    console.log('Prompt length:', prompt.length, 'chars')

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000, // Reduzido de 4096
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let insights
    try {
      let cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
      const jsonStart = cleanJson.indexOf('{')
      const jsonEnd = cleanJson.lastIndexOf('}')

      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        throw new Error('No valid JSON found')
      }

      cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1)
      insights = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Parse error:', responseText.substring(0, 300))
      throw new Error('Failed to parse AI response')
    }

    insights.generatedAt = new Date().toISOString()
    insights.roundNumber = gameData.currentRoundIndex + 1

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate insights' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
