-- Migration 4: Corrige sede e estadio de todas as partidas (fase de grupos)
-- Dados verificados via tabela de partidas real + calendário oficial FIFA 2026
-- Fase mata-mata fica sem sede/estadio pois os locais serão definidos conforme o torneio avança

-- Zera dados incorretos da migration anterior
UPDATE partidas SET sede = NULL, estadio = NULL WHERE id BETWEEN 1 AND 72;

-- ============================================================
-- RODADA 1
-- ============================================================
UPDATE partidas SET sede = 'Cidade do México',        estadio = 'Estadio Azteca'              WHERE id = 1;   -- México x África do Sul
UPDATE partidas SET sede = 'Guadalajara',             estadio = 'Estadio Akron'               WHERE id = 2;   -- Coreia do Sul x República Tcheca
UPDATE partidas SET sede = 'Toronto',                 estadio = 'BMO Field'                   WHERE id = 3;   -- Canadá x Bósnia e Herzegovina
UPDATE partidas SET sede = 'Los Angeles',             estadio = 'SoFi Stadium'                WHERE id = 4;   -- Estados Unidos x Paraguai
UPDATE partidas SET sede = 'San Francisco',           estadio = 'Levi''s Stadium'             WHERE id = 5;   -- Catar x Suíça
UPDATE partidas SET sede = 'Nova York/Nova Jersey',   estadio = 'MetLife Stadium'             WHERE id = 6;   -- Brasil x Marrocos
UPDATE partidas SET sede = 'Boston',                  estadio = 'Gillette Stadium'            WHERE id = 7;   -- Haiti x Escócia
UPDATE partidas SET sede = 'Vancouver',               estadio = 'BC Place'                    WHERE id = 8;   -- Austrália x Turquia
UPDATE partidas SET sede = 'Houston',                 estadio = 'NRG Stadium'                 WHERE id = 9;   -- Alemanha x Curaçao
UPDATE partidas SET sede = 'Dallas',                  estadio = 'AT&T Stadium'                WHERE id = 10;  -- Holanda x Japão
UPDATE partidas SET sede = 'Philadelphia',            estadio = 'Lincoln Financial Field'     WHERE id = 11;  -- Costa do Marfim x Equador
UPDATE partidas SET sede = 'Monterrey',               estadio = 'Estadio BBVA'                WHERE id = 12;  -- Suécia x Tunísia
UPDATE partidas SET sede = 'Atlanta',                 estadio = 'Mercedes-Benz Stadium'       WHERE id = 13;  -- Espanha x Cabo Verde
UPDATE partidas SET sede = 'Seattle',                 estadio = 'Lumen Field'                 WHERE id = 14;  -- Bélgica x Egito
UPDATE partidas SET sede = 'Miami',                   estadio = 'Hard Rock Stadium'           WHERE id = 15;  -- Arábia Saudita x Uruguai
UPDATE partidas SET sede = 'Los Angeles',             estadio = 'SoFi Stadium'                WHERE id = 16;  -- Irã x Nova Zelândia
UPDATE partidas SET sede = 'Nova York/Nova Jersey',   estadio = 'MetLife Stadium'             WHERE id = 17;  -- França x Senegal
UPDATE partidas SET sede = 'Boston',                  estadio = 'Gillette Stadium'            WHERE id = 18;  -- Iraque x Noruega
UPDATE partidas SET sede = 'Kansas City',             estadio = 'GEHA Field at Arrowhead Stadium' WHERE id = 19; -- Argentina x Argélia
UPDATE partidas SET sede = 'San Francisco',           estadio = 'Levi''s Stadium'             WHERE id = 20;  -- Áustria x Jordânia
UPDATE partidas SET sede = 'Houston',                 estadio = 'NRG Stadium'                 WHERE id = 21;  -- Portugal x RD Congo
UPDATE partidas SET sede = 'Dallas',                  estadio = 'AT&T Stadium'                WHERE id = 22;  -- Inglaterra x Croácia
UPDATE partidas SET sede = 'Toronto',                 estadio = 'BMO Field'                   WHERE id = 23;  -- Gana x Panamá
UPDATE partidas SET sede = 'Cidade do México',        estadio = 'Estadio Azteca'              WHERE id = 24;  -- Uzbequistão x Colômbia

-- ============================================================
-- RODADA 2
-- ============================================================
UPDATE partidas SET sede = 'Boston',                  estadio = 'Gillette Stadium'            WHERE id = 25;  -- República Tcheca x África do Sul
UPDATE partidas SET sede = 'Los Angeles',             estadio = 'SoFi Stadium'                WHERE id = 26;  -- Suíça x Bósnia e Herzegovina
UPDATE partidas SET sede = 'Vancouver',               estadio = 'BC Place'                    WHERE id = 27;  -- Canadá x Catar
UPDATE partidas SET sede = 'Guadalajara',             estadio = 'Estadio Akron'               WHERE id = 28;  -- México x Coreia do Sul
UPDATE partidas SET sede = 'Seattle',                 estadio = 'Lumen Field'                 WHERE id = 29;  -- Estados Unidos x Austrália
UPDATE partidas SET sede = 'Boston',                  estadio = 'Gillette Stadium'            WHERE id = 30;  -- Escócia x Marrocos
UPDATE partidas SET sede = 'Philadelphia',            estadio = 'Lincoln Financial Field'     WHERE id = 31;  -- Brasil x Haiti
UPDATE partidas SET sede = 'San Francisco',           estadio = 'Levi''s Stadium'             WHERE id = 32;  -- Turquia x Paraguai
UPDATE partidas SET sede = 'Houston',                 estadio = 'NRG Stadium'                 WHERE id = 33;  -- Holanda x Suécia
UPDATE partidas SET sede = 'Toronto',                 estadio = 'BMO Field'                   WHERE id = 34;  -- Alemanha x Costa do Marfim
UPDATE partidas SET sede = 'Kansas City',             estadio = 'GEHA Field at Arrowhead Stadium' WHERE id = 35; -- Equador x Curaçao
UPDATE partidas SET sede = 'Monterrey',               estadio = 'Estadio BBVA'                WHERE id = 36;  -- Tunísia x Japão
UPDATE partidas SET sede = 'Atlanta',                 estadio = 'Mercedes-Benz Stadium'       WHERE id = 37;  -- Espanha x Arábia Saudita
UPDATE partidas SET sede = 'Los Angeles',             estadio = 'SoFi Stadium'                WHERE id = 38;  -- Bélgica x Irã
UPDATE partidas SET sede = 'Miami',                   estadio = 'Hard Rock Stadium'           WHERE id = 39;  -- Uruguai x Cabo Verde
UPDATE partidas SET sede = 'Vancouver',               estadio = 'BC Place'                    WHERE id = 40;  -- Nova Zelândia x Egito
UPDATE partidas SET sede = 'Philadelphia',            estadio = 'Lincoln Financial Field'     WHERE id = 41;  -- França x Iraque
UPDATE partidas SET sede = 'Nova York/Nova Jersey',   estadio = 'MetLife Stadium'             WHERE id = 42;  -- Noruega x Senegal
UPDATE partidas SET sede = 'Dallas',                  estadio = 'AT&T Stadium'                WHERE id = 43;  -- Argentina x Áustria
UPDATE partidas SET sede = 'San Francisco',           estadio = 'Levi''s Stadium'             WHERE id = 44;  -- Jordânia x Argélia
UPDATE partidas SET sede = 'Houston',                 estadio = 'NRG Stadium'                 WHERE id = 45;  -- Portugal x Uzbequistão
UPDATE partidas SET sede = 'Boston',                  estadio = 'Gillette Stadium'            WHERE id = 46;  -- Inglaterra x Gana
UPDATE partidas SET sede = 'Toronto',                 estadio = 'BMO Field'                   WHERE id = 47;  -- Panamá x Croácia
UPDATE partidas SET sede = 'Guadalajara',             estadio = 'Estadio Akron'               WHERE id = 48;  -- Colômbia x RD Congo

-- ============================================================
-- RODADA 3
-- ============================================================
UPDATE partidas SET sede = 'Vancouver',               estadio = 'BC Place'                    WHERE id = 49;  -- Suíça x Canadá
UPDATE partidas SET sede = 'Seattle',                 estadio = 'Lumen Field'                 WHERE id = 50;  -- Bósnia e Herzegovina x Catar
UPDATE partidas SET sede = 'Miami',                   estadio = 'Hard Rock Stadium'           WHERE id = 51;  -- Escócia x Brasil
UPDATE partidas SET sede = 'Atlanta',                 estadio = 'Mercedes-Benz Stadium'       WHERE id = 52;  -- Marrocos x Haiti
UPDATE partidas SET sede = 'Cidade do México',        estadio = 'Estadio Azteca'              WHERE id = 53;  -- República Tcheca x México
UPDATE partidas SET sede = 'Monterrey',               estadio = 'Estadio BBVA'                WHERE id = 54;  -- África do Sul x Coreia do Sul
UPDATE partidas SET sede = 'Nova York/Nova Jersey',   estadio = 'MetLife Stadium'             WHERE id = 55;  -- Equador x Alemanha
UPDATE partidas SET sede = 'Philadelphia',            estadio = 'Lincoln Financial Field'     WHERE id = 56;  -- Curaçao x Costa do Marfim
UPDATE partidas SET sede = 'Dallas',                  estadio = 'AT&T Stadium'                WHERE id = 57;  -- Japão x Suécia
UPDATE partidas SET sede = 'Kansas City',             estadio = 'GEHA Field at Arrowhead Stadium' WHERE id = 58; -- Tunísia x Holanda
UPDATE partidas SET sede = 'Los Angeles',             estadio = 'SoFi Stadium'                WHERE id = 59;  -- Turquia x Estados Unidos
UPDATE partidas SET sede = 'San Francisco',           estadio = 'Levi''s Stadium'             WHERE id = 60;  -- Paraguai x Austrália
UPDATE partidas SET sede = 'Boston',                  estadio = 'Gillette Stadium'            WHERE id = 61;  -- Noruega x França
UPDATE partidas SET sede = 'Toronto',                 estadio = 'BMO Field'                   WHERE id = 62;  -- Senegal x Iraque
UPDATE partidas SET sede = 'Houston',                 estadio = 'NRG Stadium'                 WHERE id = 63;  -- Cabo Verde x Arábia Saudita
UPDATE partidas SET sede = 'Guadalajara',             estadio = 'Estadio Akron'               WHERE id = 64;  -- Uruguai x Espanha
UPDATE partidas SET sede = 'Vancouver',               estadio = 'BC Place'                    WHERE id = 65;  -- Nova Zelândia x Bélgica
UPDATE partidas SET sede = 'Seattle',                 estadio = 'Lumen Field'                 WHERE id = 66;  -- Egito x Irã
UPDATE partidas SET sede = 'Nova York/Nova Jersey',   estadio = 'MetLife Stadium'             WHERE id = 67;  -- Panamá x Inglaterra
UPDATE partidas SET sede = 'Philadelphia',            estadio = 'Lincoln Financial Field'     WHERE id = 68;  -- Croácia x Gana
UPDATE partidas SET sede = 'Miami',                   estadio = 'Hard Rock Stadium'           WHERE id = 69;  -- Colômbia x Portugal
UPDATE partidas SET sede = 'Atlanta',                 estadio = 'Mercedes-Benz Stadium'       WHERE id = 70;  -- RD Congo x Uzbequistão
UPDATE partidas SET sede = 'Dallas',                  estadio = 'AT&T Stadium'                WHERE id = 71;  -- Argentina x Jordânia
UPDATE partidas SET sede = 'Kansas City',             estadio = 'GEHA Field at Arrowhead Stadium' WHERE id = 72; -- Argélia x Áustria
