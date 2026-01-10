-- ============================================
-- ESTIMATIVA - Setup do Supabase
-- ============================================
-- Execute este SQL no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query
-- ============================================

-- 1. Criar tabela principal
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

-- 2. Criar índices para performance
CREATE INDEX idx_shared_games_code ON shared_games(code);
CREATE INDEX idx_shared_games_status ON shared_games(status);
CREATE INDEX idx_shared_games_updated_at ON shared_games(updated_at);

-- 3. Trigger para atualizar updated_at automaticamente
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

-- 4. Habilitar Row Level Security
ALTER TABLE shared_games ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso (RLS)

-- Qualquer um pode ler jogos ativos
CREATE POLICY "read_active_games" ON shared_games
  FOR SELECT
  USING (status = 'active');

-- Qualquer um pode criar jogos
CREATE POLICY "insert_games" ON shared_games
  FOR INSERT
  WITH CHECK (true);

-- Qualquer um pode atualizar (validação no frontend)
CREATE POLICY "update_games" ON shared_games
  FOR UPDATE
  USING (true);

-- 6. Habilitar Realtime para a tabela
-- No Dashboard: Database > Replication > shared_games > Enable

-- ============================================
-- CLEANUP AUTOMÁTICO (CRON JOB)
-- ============================================
-- Execute separadamente após instalar a extensão pg_cron

-- Habilitar extensão pg_cron (se ainda não habilitada)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar limpeza a cada 30 minutos
-- SELECT cron.schedule(
--   'cleanup-expired-games',
--   '*/30 * * * *',
--   $$
--   DELETE FROM shared_games
--   WHERE updated_at < NOW() - INTERVAL '3 hours'
--     AND status = 'active';
--   $$
-- );

-- ============================================
-- LIMPEZA MANUAL (se necessário)
-- ============================================
-- DELETE FROM shared_games
-- WHERE updated_at < NOW() - INTERVAL '3 hours'
--   AND status = 'active';

-- ============================================
-- VERIFICAR CONFIGURAÇÃO
-- ============================================
-- SELECT * FROM shared_games LIMIT 10;
-- SELECT COUNT(*) FROM shared_games WHERE status = 'active';
