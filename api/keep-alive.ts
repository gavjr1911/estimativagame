import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Proteger endpoint: apenas GET e cron autorizado
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ status: 'error', message: 'Missing Supabase env vars' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('shared_games')
      .select('id', { count: 'exact', head: true })
      .limit(1)

    if (error) throw error

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Keep-Alive] Error:', error)
    return res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
  }
}
