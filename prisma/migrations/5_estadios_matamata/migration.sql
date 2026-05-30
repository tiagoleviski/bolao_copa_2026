-- Migration 5: Sede e estadio para a fase mata-mata (Segunda Fase até a Final)
-- IDs verificados contra a tabela de partidas real + calendário oficial FIFA 2026

-- ============================================================
-- SEGUNDA FASE (Rodada de 32, IDs 73–88)
-- ============================================================
UPDATE partidas SET sede = 'Los Angeles',           estadio = 'SoFi Stadium'                    WHERE id = 73;
UPDATE partidas SET sede = 'Houston',               estadio = 'NRG Stadium'                     WHERE id = 74;
UPDATE partidas SET sede = 'Boston',                estadio = 'Gillette Stadium'                WHERE id = 75;
UPDATE partidas SET sede = 'Monterrey',             estadio = 'Estadio BBVA'                    WHERE id = 76;
UPDATE partidas SET sede = 'Dallas',                estadio = 'AT&T Stadium'                    WHERE id = 77;
UPDATE partidas SET sede = 'Nova York/Nova Jersey', estadio = 'MetLife Stadium'                 WHERE id = 78;
UPDATE partidas SET sede = 'Cidade do México',      estadio = 'Estadio Azteca'                  WHERE id = 79;
UPDATE partidas SET sede = 'Atlanta',               estadio = 'Mercedes-Benz Stadium'           WHERE id = 80;
UPDATE partidas SET sede = 'Seattle',               estadio = 'Lumen Field'                     WHERE id = 81;
UPDATE partidas SET sede = 'San Francisco',         estadio = 'Levi''s Stadium'                 WHERE id = 82;
UPDATE partidas SET sede = 'Los Angeles',           estadio = 'SoFi Stadium'                    WHERE id = 83;
UPDATE partidas SET sede = 'Toronto',               estadio = 'BMO Field'                       WHERE id = 84;
UPDATE partidas SET sede = 'Vancouver',             estadio = 'BC Place'                        WHERE id = 85;
UPDATE partidas SET sede = 'Dallas',                estadio = 'AT&T Stadium'                    WHERE id = 86;
UPDATE partidas SET sede = 'Miami',                 estadio = 'Hard Rock Stadium'               WHERE id = 87;
UPDATE partidas SET sede = 'Kansas City',           estadio = 'GEHA Field at Arrowhead Stadium' WHERE id = 88;

-- ============================================================
-- OITAVAS DE FINAL (IDs 89–96)
-- ============================================================
UPDATE partidas SET sede = 'Houston',               estadio = 'NRG Stadium'                     WHERE id = 89;
UPDATE partidas SET sede = 'Philadelphia',          estadio = 'Lincoln Financial Field'         WHERE id = 90;
UPDATE partidas SET sede = 'Nova York/Nova Jersey', estadio = 'MetLife Stadium'                 WHERE id = 91;
UPDATE partidas SET sede = 'Cidade do México',      estadio = 'Estadio Azteca'                  WHERE id = 92;
UPDATE partidas SET sede = 'Seattle',               estadio = 'Lumen Field'                     WHERE id = 93;
UPDATE partidas SET sede = 'Dallas',                estadio = 'AT&T Stadium'                    WHERE id = 94;
UPDATE partidas SET sede = 'Vancouver',             estadio = 'BC Place'                        WHERE id = 95;
UPDATE partidas SET sede = 'Atlanta',               estadio = 'Mercedes-Benz Stadium'           WHERE id = 96;

-- ============================================================
-- QUARTAS DE FINAL (IDs 97–100)
-- ============================================================
UPDATE partidas SET sede = 'Boston',                estadio = 'Gillette Stadium'                WHERE id = 97;
UPDATE partidas SET sede = 'Los Angeles',           estadio = 'SoFi Stadium'                    WHERE id = 98;
UPDATE partidas SET sede = 'Miami',                 estadio = 'Hard Rock Stadium'               WHERE id = 99;
UPDATE partidas SET sede = 'Kansas City',           estadio = 'GEHA Field at Arrowhead Stadium' WHERE id = 100;

-- ============================================================
-- SEMIFINAL (IDs 101–102)
-- ============================================================
UPDATE partidas SET sede = 'Dallas',                estadio = 'AT&T Stadium'                    WHERE id = 101;
UPDATE partidas SET sede = 'Atlanta',               estadio = 'Mercedes-Benz Stadium'           WHERE id = 102;

-- ============================================================
-- DISPUTA DO 3º LUGAR (ID 103)
-- ============================================================
UPDATE partidas SET sede = 'Miami',                 estadio = 'Hard Rock Stadium'               WHERE id = 103;

-- ============================================================
-- FINAL (ID 104)
-- ============================================================
UPDATE partidas SET sede = 'Nova York/Nova Jersey', estadio = 'MetLife Stadium'                 WHERE id = 104;
