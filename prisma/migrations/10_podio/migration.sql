-- Migration 10: tabela de apostas no pódio (1°, 2° e 3° lugar)

-- Aposta do usuário no pódio
CREATE TABLE IF NOT EXISTS aposta_podio (
  id      SERIAL PRIMARY KEY,
  user_id UUID    NOT NULL,
  posicao INTEGER NOT NULL CHECK (posicao BETWEEN 1 AND 3),
  pais_id INTEGER NOT NULL REFERENCES paises(id) ON DELETE CASCADE,
  UNIQUE(user_id, posicao)
);

ALTER TABLE aposta_podio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own aposta_podio"
  ON aposta_podio FOR ALL
  USING (auth.uid() = user_id);

-- Pódio oficial (preenchido pelo admin após o torneio)
CREATE TABLE IF NOT EXISTS podio_oficial (
  id      SERIAL PRIMARY KEY,
  posicao INTEGER NOT NULL CHECK (posicao BETWEEN 1 AND 3) UNIQUE,
  pais_id INTEGER NOT NULL REFERENCES paises(id) ON DELETE CASCADE
);

ALTER TABLE podio_oficial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone reads podio_oficial"
  ON podio_oficial FOR SELECT
  USING (true);

CREATE POLICY "Admins manage podio_oficial"
  ON podio_oficial FOR ALL
  USING (
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin')
  );
