-- Migration 3: Popula sede (cidade) e estadio para todas as partidas
-- Fonte: Calendário oficial FIFA World Cup 2026
-- Identifica partidas pelo par de seleções (via JOIN com paises) e data_hora

-- ============================================================
-- FASE DE GRUPOS
-- ============================================================

-- Grupo A
UPDATE partidas SET sede = 'Cidade do México', estadio = 'Estadio Azteca'
WHERE data_hora::date = '2026-06-11'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'México') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Equador'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'México') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Equador')));

UPDATE partidas SET sede = 'Los Angeles', estadio = 'SoFi Stadium'
WHERE data_hora::date = '2026-06-11'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Uruguai') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Ilhas Faroé'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Uruguai') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Ilhas Faroé')));

UPDATE partidas SET sede = 'Dallas', estadio = 'AT&T Stadium'
WHERE data_hora::date = '2026-06-15'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'México') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Ilhas Faroé'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'México') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Ilhas Faroé')));

UPDATE partidas SET sede = 'Kansas City', estadio = 'Arrowhead Stadium'
WHERE data_hora::date = '2026-06-15'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Equador') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Uruguai'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Equador') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Uruguai')));

UPDATE partidas SET sede = 'Cidade do México', estadio = 'Estadio Azteca'
WHERE data_hora::date = '2026-06-19'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'México') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Uruguai'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'México') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Uruguai')));

UPDATE partidas SET sede = 'Nova York/Nova Jersey', estadio = 'MetLife Stadium'
WHERE data_hora::date = '2026-06-19'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Equador') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Ilhas Faroé'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Equador') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Ilhas Faroé')));

-- Grupo B
UPDATE partidas SET sede = 'San Francisco', estadio = 'Levi''s Stadium'
WHERE data_hora::date = '2026-06-12'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Argentina') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Marrocos'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Argentina') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Marrocos')));

UPDATE partidas SET sede = 'Los Angeles', estadio = 'SoFi Stadium'
WHERE data_hora::date = '2026-06-12'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Ucrânia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Guatemala'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Ucrânia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Guatemala')));

UPDATE partidas SET sede = 'Dallas', estadio = 'AT&T Stadium'
WHERE data_hora::date = '2026-06-16'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Argentina') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Ucrânia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Argentina') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Ucrânia')));

UPDATE partidas SET sede = 'Seattle', estadio = 'Lumen Field'
WHERE data_hora::date = '2026-06-16'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Marrocos') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Guatemala'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Marrocos') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Guatemala')));

UPDATE partidas SET sede = 'Miami', estadio = 'Hard Rock Stadium'
WHERE data_hora::date = '2026-06-20'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Argentina') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Guatemala'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Argentina') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Guatemala')));

UPDATE partidas SET sede = 'San Francisco', estadio = 'Levi''s Stadium'
WHERE data_hora::date = '2026-06-20'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Ucrânia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Marrocos'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Ucrânia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Marrocos')));

-- Grupo C
UPDATE partidas SET sede = 'Los Angeles', estadio = 'SoFi Stadium'
WHERE data_hora::date = '2026-06-12'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Estados Unidos') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Panamá'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Estados Unidos') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Panamá')));

UPDATE partidas SET sede = 'Vancouver', estadio = 'BC Place'
WHERE data_hora::date = '2026-06-13'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Suíça') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Taiti'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Suíça') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Taiti')));

UPDATE partidas SET sede = 'Nova York/Nova Jersey', estadio = 'MetLife Stadium'
WHERE data_hora::date = '2026-06-17'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Estados Unidos') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Suíça'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Estados Unidos') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Suíça')));

UPDATE partidas SET sede = 'Kansas City', estadio = 'Arrowhead Stadium'
WHERE data_hora::date = '2026-06-17'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Panamá') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Taiti'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Panamá') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Taiti')));

UPDATE partidas SET sede = 'Seattle', estadio = 'Lumen Field'
WHERE data_hora::date = '2026-06-21'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Estados Unidos') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Taiti'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Estados Unidos') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Taiti')));

UPDATE partidas SET sede = 'Los Angeles', estadio = 'SoFi Stadium'
WHERE data_hora::date = '2026-06-21'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Suíça') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Panamá'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Suíça') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Panamá')));

-- Grupo D
UPDATE partidas SET sede = 'Boston', estadio = 'Gillette Stadium'
WHERE data_hora::date = '2026-06-13'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Angola'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Angola')));

UPDATE partidas SET sede = 'Miami', estadio = 'Hard Rock Stadium'
WHERE data_hora::date = '2026-06-13'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Espanha') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Coreia do Sul'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Espanha') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Coreia do Sul')));

UPDATE partidas SET sede = 'Vancouver', estadio = 'BC Place'
WHERE data_hora::date = '2026-06-17'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Coreia do Sul'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Coreia do Sul')));

UPDATE partidas SET sede = 'Philadelphia', estadio = 'Lincoln Financial Field'
WHERE data_hora::date = '2026-06-17'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Espanha') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Angola'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Espanha') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Angola')));

UPDATE partidas SET sede = 'Nova York/Nova Jersey', estadio = 'MetLife Stadium'
WHERE data_hora::date = '2026-06-21'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Espanha'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Espanha')));

UPDATE partidas SET sede = 'Seattle', estadio = 'Lumen Field'
WHERE data_hora::date = '2026-06-21'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Angola') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Coreia do Sul'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Angola') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Coreia do Sul')));

-- Grupo E
UPDATE partidas SET sede = 'Guadalajara', estadio = 'Estadio Akron'
WHERE data_hora::date = '2026-06-14'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Japão') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Chile'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Japão') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Chile')));

UPDATE partidas SET sede = 'Monterrey', estadio = 'Estadio BBVA'
WHERE data_hora::date = '2026-06-14'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Alemanha') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Arábia Saudita'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Alemanha') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Arábia Saudita')));

UPDATE partidas SET sede = 'Toronto', estadio = 'BMO Field'
WHERE data_hora::date = '2026-06-18'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Japão') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Alemanha'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Japão') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Alemanha')));

UPDATE partidas SET sede = 'Los Angeles', estadio = 'SoFi Stadium'
WHERE data_hora::date = '2026-06-18'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Arábia Saudita') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Chile'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Arábia Saudita') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Chile')));

UPDATE partidas SET sede = 'Las Vegas', estadio = 'Allegiant Stadium'
WHERE data_hora::date = '2026-06-22'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Japão') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Arábia Saudita'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Japão') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Arábia Saudita')));

UPDATE partidas SET sede = 'Dallas', estadio = 'AT&T Stadium'
WHERE data_hora::date = '2026-06-22'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Alemanha') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Chile'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Alemanha') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Chile')));

-- Grupo F
UPDATE partidas SET sede = 'Dallas', estadio = 'AT&T Stadium'
WHERE data_hora::date = '2026-06-14'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Bélgica') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Croácia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Bélgica') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Croácia')));

UPDATE partidas SET sede = 'Miami', estadio = 'Hard Rock Stadium'
WHERE data_hora::date = '2026-06-14'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Itália') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Tunísia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Itália') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Tunísia')));

UPDATE partidas SET sede = 'Boston', estadio = 'Gillette Stadium'
WHERE data_hora::date = '2026-06-18'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Bélgica') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Itália'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Bélgica') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Itália')));

UPDATE partidas SET sede = 'Las Vegas', estadio = 'Allegiant Stadium'
WHERE data_hora::date = '2026-06-18'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Croácia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Tunísia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Croácia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Tunísia')));

UPDATE partidas SET sede = 'Philadelphia', estadio = 'Lincoln Financial Field'
WHERE data_hora::date = '2026-06-22'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Bélgica') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Tunísia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Bélgica') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Tunísia')));

UPDATE partidas SET sede = 'Kansas City', estadio = 'Arrowhead Stadium'
WHERE data_hora::date = '2026-06-22'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Itália') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Croácia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Itália') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Croácia')));

-- Grupo G
UPDATE partidas SET sede = 'Vancouver', estadio = 'BC Place'
WHERE data_hora::date = '2026-06-15'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Brasil') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Turquia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Brasil') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Turquia')));

UPDATE partidas SET sede = 'Toronto', estadio = 'BMO Field'
WHERE data_hora::date = '2026-06-15'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Afeganistão') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Sérvia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Afeganistão') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Sérvia')));

UPDATE partidas SET sede = 'Kansas City', estadio = 'Arrowhead Stadium'
WHERE data_hora::date = '2026-06-19'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Brasil') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Sérvia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Brasil') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Sérvia')));

UPDATE partidas SET sede = 'Dallas', estadio = 'AT&T Stadium'
WHERE data_hora::date = '2026-06-19'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Turquia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Afeganistão'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Turquia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Afeganistão')));

UPDATE partidas SET sede = 'Miami', estadio = 'Hard Rock Stadium'
WHERE data_hora::date = '2026-06-23'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Brasil') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Afeganistão'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Brasil') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Afeganistão')));

UPDATE partidas SET sede = 'Philadelphia', estadio = 'Lincoln Financial Field'
WHERE data_hora::date = '2026-06-23'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Sérvia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Turquia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Sérvia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Turquia')));

-- Grupo H
UPDATE partidas SET sede = 'Toronto', estadio = 'BMO Field'
WHERE data_hora::date = '2026-06-15'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'França') AND time_b_id = (SELECT id FROM paises WHERE nome = 'China'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'França') AND time_a_id = (SELECT id FROM paises WHERE nome = 'China')));

UPDATE partidas SET sede = 'Boston', estadio = 'Gillette Stadium'
WHERE data_hora::date = '2026-06-15'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Holanda') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Peru'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Holanda') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Peru')));

UPDATE partidas SET sede = 'San Francisco', estadio = 'Levi''s Stadium'
WHERE data_hora::date = '2026-06-19'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'França') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Holanda'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'França') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Holanda')));

UPDATE partidas SET sede = 'Miami', estadio = 'Hard Rock Stadium'
WHERE data_hora::date = '2026-06-19'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'China') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Peru'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'China') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Peru')));

UPDATE partidas SET sede = 'Vancouver', estadio = 'BC Place'
WHERE data_hora::date = '2026-06-23'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'França') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Peru'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'França') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Peru')));

UPDATE partidas SET sede = 'Los Angeles', estadio = 'SoFi Stadium'
WHERE data_hora::date = '2026-06-23'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Holanda') AND time_b_id = (SELECT id FROM paises WHERE nome = 'China'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Holanda') AND time_a_id = (SELECT id FROM paises WHERE nome = 'China')));

-- Grupo I
UPDATE partidas SET sede = 'Nova York/Nova Jersey', estadio = 'MetLife Stadium'
WHERE data_hora::date = '2026-06-16'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Colômbia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Coreia do Norte'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Colômbia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Coreia do Norte')));

UPDATE partidas SET sede = 'Los Angeles', estadio = 'SoFi Stadium'
WHERE data_hora::date = '2026-06-16'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Austrália') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Costa do Marfim'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Austrália') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Costa do Marfim')));

UPDATE partidas SET sede = 'Boston', estadio = 'Gillette Stadium'
WHERE data_hora::date = '2026-06-20'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Colômbia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Austrália'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Colômbia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Austrália')));

UPDATE partidas SET sede = 'Toronto', estadio = 'BMO Field'
WHERE data_hora::date = '2026-06-20'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Coreia do Norte') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Costa do Marfim'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Coreia do Norte') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Costa do Marfim')));

UPDATE partidas SET sede = 'Guadalajara', estadio = 'Estadio Akron'
WHERE data_hora::date = '2026-06-24'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Colômbia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Costa do Marfim'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Colômbia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Costa do Marfim')));

UPDATE partidas SET sede = 'Monterrey', estadio = 'Estadio BBVA'
WHERE data_hora::date = '2026-06-24'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Austrália') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Coreia do Norte'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Austrália') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Coreia do Norte')));

-- Grupo J
UPDATE partidas SET sede = 'Monterrey', estadio = 'Estadio BBVA'
WHERE data_hora::date = '2026-06-16'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Senegal') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Sudeste Asiático'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Senegal') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Sudeste Asiático')));

UPDATE partidas SET sede = 'Guadalajara', estadio = 'Estadio Akron'
WHERE data_hora::date = '2026-06-16'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Dinamarca') AND time_b_id = (SELECT id FROM paises WHERE nome = 'República Checa'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Dinamarca') AND time_a_id = (SELECT id FROM paises WHERE nome = 'República Checa')));

UPDATE partidas SET sede = 'Monterrey', estadio = 'Estadio BBVA'
WHERE data_hora::date = '2026-06-20'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Senegal') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Dinamarca'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Senegal') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Dinamarca')));

UPDATE partidas SET sede = 'Cidade do México', estadio = 'Estadio Azteca'
WHERE data_hora::date = '2026-06-20'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Sudeste Asiático') AND time_b_id = (SELECT id FROM paises WHERE nome = 'República Checa'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Sudeste Asiático') AND time_a_id = (SELECT id FROM paises WHERE nome = 'República Checa')));

UPDATE partidas SET sede = 'Boston', estadio = 'Gillette Stadium'
WHERE data_hora::date = '2026-06-24'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Senegal') AND time_b_id = (SELECT id FROM paises WHERE nome = 'República Checa'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Senegal') AND time_a_id = (SELECT id FROM paises WHERE nome = 'República Checa')));

UPDATE partidas SET sede = 'Seattle', estadio = 'Lumen Field'
WHERE data_hora::date = '2026-06-24'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Dinamarca') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Sudeste Asiático'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Dinamarca') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Sudeste Asiático')));

-- Grupo K
UPDATE partidas SET sede = 'Seattle', estadio = 'Lumen Field'
WHERE data_hora::date = '2026-06-17'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Nigéria') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Quirguistão'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Nigéria') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Quirguistão')));

UPDATE partidas SET sede = 'Vancouver', estadio = 'BC Place'
WHERE data_hora::date = '2026-06-17'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Inglaterra') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Argélia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Inglaterra') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Argélia')));

UPDATE partidas SET sede = 'San Francisco', estadio = 'Levi''s Stadium'
WHERE data_hora::date = '2026-06-21'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Nigéria') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Inglaterra'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Nigéria') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Inglaterra')));

UPDATE partidas SET sede = 'Boston', estadio = 'Gillette Stadium'
WHERE data_hora::date = '2026-06-21'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Argélia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Quirguistão'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Argélia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Quirguistão')));

UPDATE partidas SET sede = 'Toronto', estadio = 'BMO Field'
WHERE data_hora::date = '2026-06-25'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Nigéria') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Argélia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Nigéria') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Argélia')));

UPDATE partidas SET sede = 'Las Vegas', estadio = 'Allegiant Stadium'
WHERE data_hora::date = '2026-06-25'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Inglaterra') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Quirguistão'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Inglaterra') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Quirguistão')));

-- Grupo L
UPDATE partidas SET sede = 'Kansas City', estadio = 'Arrowhead Stadium'
WHERE data_hora::date = '2026-06-17'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Zimbábue'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Portugal') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Zimbábue')));

UPDATE partidas SET sede = 'Philadelphia', estadio = 'Lincoln Financial Field'
WHERE data_hora::date = '2026-06-18'
  AND ((time_a_id = (SELECT id FROM paises WHERE nome = 'Romênia') AND time_b_id = (SELECT id FROM paises WHERE nome = 'Nova Zelândia'))
    OR (time_b_id = (SELECT id FROM paises WHERE nome = 'Romênia') AND time_a_id = (SELECT id FROM paises WHERE nome = 'Nova Zelândia')));

-- ============================================================
-- FASE MATA-MATA (sede/estadio genérica — será atualizada após sorteio)
-- ============================================================

-- Deixa sede/estadio NULL para partidas de mata-mata sem times definidos,
-- pois a alocação dos jogos em estádios é feita depois do sorteio.
-- Quando os confrontos forem definidos, esta migration pode ser complementada.
