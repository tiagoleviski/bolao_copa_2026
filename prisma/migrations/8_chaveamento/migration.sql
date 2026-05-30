-- Migration 8: tabelas para o chaveamento (fase de grupos + mata-mata)

-- 1. Previsão de posição no grupo (1°/2°/3°/4° por seleção)
CREATE TABLE IF NOT EXISTS previsao_grupo (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL,
  pais_id         INTEGER NOT NULL REFERENCES paises(id) ON DELETE CASCADE,
  posicao         INTEGER NOT NULL CHECK (posicao BETWEEN 1 AND 4),
  terceiro_avanca BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, pais_id)
);

ALTER TABLE previsao_grupo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own previsao_grupo"
  ON previsao_grupo FOR ALL
  USING (auth.uid() = user_id);

-- 2. Previsão de vencedor por partida do chaveamento
--    fase: 'Segunda Fase' | 'Oitavas de Final' | 'Quartas de Final' | 'Semifinal' | 'Terceiro Lugar' | 'Final'
--    slot: posição da partida naquela fase (1..16 para Segunda Fase, 1..8 para Oitavas, etc.)
--    pais_id: seleção prevista para VENCER essa partida (i.e., avançar)
CREATE TABLE IF NOT EXISTS previsao_chaveamento (
  id      SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  fase    TEXT NOT NULL,
  slot    INTEGER NOT NULL,
  pais_id INTEGER NOT NULL REFERENCES paises(id) ON DELETE CASCADE,
  UNIQUE(user_id, fase, slot)
);

ALTER TABLE previsao_chaveamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own previsao_chaveamento"
  ON previsao_chaveamento FOR ALL
  USING (auth.uid() = user_id);

-- 3. Resultado oficial do chaveamento (preenchido pelo admin)
--    Mesma estrutura: fase + slot + vencedor real
CREATE TABLE IF NOT EXISTS resultado_chaveamento_oficial (
  id      SERIAL PRIMARY KEY,
  fase    TEXT NOT NULL,
  slot    INTEGER NOT NULL,
  pais_id INTEGER NOT NULL REFERENCES paises(id) ON DELETE CASCADE,
  UNIQUE(fase, slot)
);

ALTER TABLE resultado_chaveamento_oficial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read resultado_chaveamento_oficial"
  ON resultado_chaveamento_oficial FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage resultado_chaveamento_oficial"
  ON resultado_chaveamento_oficial FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Resultado oficial da fase de grupos (preenchido pelo admin)
CREATE TABLE IF NOT EXISTS posicao_oficial_grupo (
  id      SERIAL PRIMARY KEY,
  pais_id INTEGER NOT NULL REFERENCES paises(id) ON DELETE CASCADE UNIQUE,
  posicao INTEGER NOT NULL CHECK (posicao BETWEEN 1 AND 4),
  terceiro_avancou BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE posicao_oficial_grupo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read posicao_oficial_grupo"
  ON posicao_oficial_grupo FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage posicao_oficial_grupo"
  ON posicao_oficial_grupo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin'
    )
  );
