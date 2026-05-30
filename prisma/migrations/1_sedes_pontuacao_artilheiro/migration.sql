-- Migration 1: sedes nas partidas, pontuação nas apostas, tabela de artilheiro oficial

-- 1. Colunas de sede nas partidas
ALTER TABLE "partidas"
  ADD COLUMN IF NOT EXISTS "sede"    TEXT,
  ADD COLUMN IF NOT EXISTS "estadio" TEXT;

-- 2. Colunas de pontuação nas apostas
ALTER TABLE "apostas"
  ADD COLUMN IF NOT EXISTS "pontos_placar"    SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pontos_resultado" SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pontos_total"     SMALLINT NOT NULL DEFAULT 0;

-- 3. Tabela para registrar o artilheiro oficial do torneio
CREATE TABLE IF NOT EXISTS "artilheiro_oficial" (
  "id"          SERIAL PRIMARY KEY,
  "jogador_id"  INTEGER NOT NULL,
  "definido_em" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Atualiza bandeira_url para usar imagens locais (/images/flags/{id}.svg)
--    Pressupõe que os IDs do banco batem com a ordem de inserção do CSV (1-48).
UPDATE "paises"
  SET "bandeira_url" = '/images/flags/' || "id" || '.svg';
