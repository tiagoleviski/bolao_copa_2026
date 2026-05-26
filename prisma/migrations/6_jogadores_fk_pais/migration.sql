-- Limpar apostas e jogadores existentes (rebuild completo da lista)
DELETE FROM apostas_artilheiro;
DELETE FROM jogadores;

-- Resetar sequência
ALTER SEQUENCE jogadores_id_seq RESTART WITH 1;

-- Remover coluna antiga antes de inserir (evita NOT NULL constraint nos inserts)
ALTER TABLE jogadores DROP COLUMN selecao;

-- Adicionar coluna FK (nullable primeiro para poder inserir)
ALTER TABLE jogadores ADD COLUMN pais_id INTEGER;

-- Inserir jogadores (somente países já existentes em paises)
INSERT INTO jogadores (nome, pais_id) VALUES
  -- Brasil
  ('Vinícius Júnior', (SELECT id FROM paises WHERE nome = 'Brasil')),
  ('Neymar',          (SELECT id FROM paises WHERE nome = 'Brasil')),
  ('Matheus Cunha',   (SELECT id FROM paises WHERE nome = 'Brasil')),
  -- Argentina
  ('Lionel Messi',     (SELECT id FROM paises WHERE nome = 'Argentina')),
  ('Lautaro Martínez', (SELECT id FROM paises WHERE nome = 'Argentina')),
  ('Julián Álvarez',   (SELECT id FROM paises WHERE nome = 'Argentina')),
  -- Uruguai
  ('Darwin Núñez',      (SELECT id FROM paises WHERE nome = 'Uruguai')),
  ('Federico Valverde', (SELECT id FROM paises WHERE nome = 'Uruguai')),
  -- Colômbia
  ('Luis Díaz',  (SELECT id FROM paises WHERE nome = 'Colômbia')),
  ('Jhon Durán', (SELECT id FROM paises WHERE nome = 'Colômbia')),
  -- Equador
  ('Moisés Caicedo', (SELECT id FROM paises WHERE nome = 'Equador')),
  ('Enner Valencia', (SELECT id FROM paises WHERE nome = 'Equador')),
  -- México
  ('Santiago Giménez', (SELECT id FROM paises WHERE nome = 'México')),
  ('Hirving Lozano',   (SELECT id FROM paises WHERE nome = 'México')),
  -- Estados Unidos
  ('Christian Pulisic', (SELECT id FROM paises WHERE nome = 'Estados Unidos')),
  ('Folarin Balogun',   (SELECT id FROM paises WHERE nome = 'Estados Unidos')),
  -- Canadá
  ('Alphonso Davies', (SELECT id FROM paises WHERE nome = 'Canadá')),
  ('Jonathan David',  (SELECT id FROM paises WHERE nome = 'Canadá')),
  -- Haiti
  ('Duckens Nazon', (SELECT id FROM paises WHERE nome = 'Haiti')),
  -- Panamá
  ('Adalberto Carrasquilla', (SELECT id FROM paises WHERE nome = 'Panamá')),
  -- França
  ('Kylian Mbappé',   (SELECT id FROM paises WHERE nome = 'França')),
  ('Ousmane Dembélé', (SELECT id FROM paises WHERE nome = 'França')),
  -- Inglaterra
  ('Harry Kane',  (SELECT id FROM paises WHERE nome = 'Inglaterra')),
  ('Bukayo Saka', (SELECT id FROM paises WHERE nome = 'Inglaterra')),
  -- Espanha
  ('Lamine Yamal',  (SELECT id FROM paises WHERE nome = 'Espanha')),
  ('Nico Williams', (SELECT id FROM paises WHERE nome = 'Espanha')),
  -- Portugal
  ('Cristiano Ronaldo', (SELECT id FROM paises WHERE nome = 'Portugal')),
  ('Rafael Leão',       (SELECT id FROM paises WHERE nome = 'Portugal')),
  -- Alemanha
  ('Jamal Musiala', (SELECT id FROM paises WHERE nome = 'Alemanha')),
  ('Kai Havertz',   (SELECT id FROM paises WHERE nome = 'Alemanha')),
  -- Holanda
  ('Xavi Simons', (SELECT id FROM paises WHERE nome = 'Holanda')),
  ('Cody Gakpo',  (SELECT id FROM paises WHERE nome = 'Holanda')),
  -- Bélgica
  ('Kevin De Bruyne', (SELECT id FROM paises WHERE nome = 'Bélgica')),
  ('Jeremy Doku',     (SELECT id FROM paises WHERE nome = 'Bélgica')),
  -- Croácia
  ('Luka Modrić', (SELECT id FROM paises WHERE nome = 'Croácia')),
  -- Noruega
  ('Erling Haaland', (SELECT id FROM paises WHERE nome = 'Noruega')),
  -- Suécia
  ('Alexander Isak',  (SELECT id FROM paises WHERE nome = 'Suécia')),
  ('Viktor Gyökeres', (SELECT id FROM paises WHERE nome = 'Suécia')),
  -- Turquia
  ('Arda Güler', (SELECT id FROM paises WHERE nome = 'Turquia')),
  -- Escócia
  ('Scott McTominay', (SELECT id FROM paises WHERE nome = 'Escócia')),
  -- República Tcheca
  ('Patrik Schick', (SELECT id FROM paises WHERE nome = 'República Tcheca')),
  -- Egito
  ('Mohamed Salah', (SELECT id FROM paises WHERE nome = 'Egito')),
  -- Marrocos
  ('Achraf Hakimi',     (SELECT id FROM paises WHERE nome = 'Marrocos')),
  ('Youssef En-Nesyri', (SELECT id FROM paises WHERE nome = 'Marrocos')),
  -- Senegal
  ('Sadio Mané', (SELECT id FROM paises WHERE nome = 'Senegal')),
  -- Costa do Marfim
  ('Sébastien Haller', (SELECT id FROM paises WHERE nome = 'Costa do Marfim')),
  -- Tunísia
  ('Elias Achouri', (SELECT id FROM paises WHERE nome = 'Tunísia')),
  -- Argélia
  ('Riyad Mahrez', (SELECT id FROM paises WHERE nome = 'Argélia')),
  -- RD Congo
  ('Cédric Bakambu', (SELECT id FROM paises WHERE nome = 'RD Congo')),
  -- Cabo Verde
  ('Bebé', (SELECT id FROM paises WHERE nome = 'Cabo Verde')),
  -- Japão
  ('Takefusa Kubo', (SELECT id FROM paises WHERE nome = 'Japão')),
  ('Kaoru Mitoma',  (SELECT id FROM paises WHERE nome = 'Japão')),
  -- Coreia do Sul
  ('Son Heung-min', (SELECT id FROM paises WHERE nome = 'Coreia do Sul')),
  -- Austrália
  ('Mathew Leckie', (SELECT id FROM paises WHERE nome = 'Austrália')),
  -- Irã
  ('Mehdi Taremi', (SELECT id FROM paises WHERE nome = 'Irã')),
  -- Arábia Saudita
  ('Salem Al-Dawsari', (SELECT id FROM paises WHERE nome = 'Arábia Saudita')),
  -- Uzbequistão
  ('Eldor Shomurodov', (SELECT id FROM paises WHERE nome = 'Uzbequistão')),
  -- Iraque
  ('Aymen Hussein', (SELECT id FROM paises WHERE nome = 'Iraque')),
  -- Jordânia
  ('Mousa Al-Tamari', (SELECT id FROM paises WHERE nome = 'Jordânia')),
  -- Nova Zelândia
  ('Chris Wood', (SELECT id FROM paises WHERE nome = 'Nova Zelândia'));

-- Adicionar FK e NOT NULL
ALTER TABLE jogadores
  ADD CONSTRAINT fk_jogadores_pais_id FOREIGN KEY (pais_id) REFERENCES paises(id),
  ALTER COLUMN pais_id SET NOT NULL;
