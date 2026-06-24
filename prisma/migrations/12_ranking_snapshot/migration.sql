-- Snapshot das posições do ranking antes de cada resultado.
-- Permite calcular a tendência (subiu / desceu / manteve) para cada usuário.
CREATE TABLE IF NOT EXISTS ranking_snapshot (
  user_id     UUID    NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  posicao     INTEGER NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

ALTER TABLE ranking_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read ranking_snapshot"
  ON ranking_snapshot FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage ranking_snapshot"
  ON ranking_snapshot FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin'
    )
  );
