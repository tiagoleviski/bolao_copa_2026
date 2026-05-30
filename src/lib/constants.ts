// 2026-06-11 16:00 BRT (19:00 UTC) — primeiro jogo da Copa
export const PRAZO_ARTILHEIRO = new Date("2026-06-11T19:00:00Z");

export const PRAZO_PREVISOES = PRAZO_ARTILHEIRO;

export const MINUTOS_ANTES_FECHAMENTO = 0;

export const PONTUACAO = {
  PLACAR_EXATO: 2,
  RESULTADO_CORRETO: 1,
  RESULTADO_ERRADO: 0,
  ARTILHEIRO: 20,
};

export const GRUPOS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];
export const PARTIDAS_POR_GRUPO = 6;
export const TOTAL_PARTIDAS_GRUPOS = 72;

export const PONTUACAO_PODIO = {
  PODIO_EXATO: 60,
  CAMPEAO_EXATO: 30,
  VICE_EXATO: 20,
  TERCEIRO_EXATO: 10,
  TIME_NO_PODIO: 5,
};

export const PONTUACAO_GRUPO = {
  POSICAO_EXATA: 2,
  TIME_PASSOU: 1,
};

export const RODADA_LABELS: Record<number, string> = {
  1: "1ª Rodada",
  2: "2ª Rodada",
  3: "3ª Rodada",
  4: "Segunda Fase",
  5: "Oitavas de Final",
  6: "Quartas de Final",
  7: "Semifinal",
  8: "Disputa 3º Lugar",
  9: "Final",
};
