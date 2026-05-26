import { FaseClassificacao } from "./types";

// 2026-06-11 16:00 BRT (19:00 UTC) — primeiro jogo da Copa
export const PRAZO_ARTILHEIRO = new Date("2026-06-11T19:00:00Z");

// mesmo prazo: todas as previsões fecham com o apito inicial
export const PRAZO_PREVISOES = PRAZO_ARTILHEIRO;

// Betting closes exactly at kickoff (last valid bet is 1 second before)
export const MINUTOS_ANTES_FECHAMENTO = 0;

export const FASES_ORDEM: FaseClassificacao[] = [
  "Segunda Fase",
  "Oitavas de Final",
  "Quartas de Final",
  "Semifinal",
  "Campeão",
  "Vice-Campeão",
  "3º Lugar",
  "4º Lugar",
];

export const FASES_CONFIG: Record<
  FaseClassificacao,
  { label: string; limite: number; cor: string }
> = {
  "Segunda Fase": { label: "Segunda Fase", limite: 32, cor: "text-blue-400" },
  "Oitavas de Final": {
    label: "Oitavas de Final",
    limite: 16,
    cor: "text-cyan-400",
  },
  "Quartas de Final": {
    label: "Quartas de Final",
    limite: 8,
    cor: "text-green-400",
  },
  Semifinal: { label: "Semifinal", limite: 4, cor: "text-yellow-400" },
  Campeão: { label: "Campeão", limite: 1, cor: "text-amber-400" },
  "Vice-Campeão": { label: "Vice-Campeão", limite: 1, cor: "text-slate-300" },
  "3º Lugar": { label: "3º Lugar", limite: 1, cor: "text-orange-400" },
  "4º Lugar": { label: "4º Lugar", limite: 1, cor: "text-slate-400" },
};

export const PONTUACAO = {
  PLACAR_EXATO: 10,
  RESULTADO_CORRETO: 5,
  RESULTADO_ERRADO: 0,
  CLASSIFICACAO: {
    "Segunda Fase": 2,
    "Oitavas de Final": 3,
    "Quartas de Final": 4,
    Semifinal: 5,
    Campeão: 15,
    "Vice-Campeão": 8,
    "3º Lugar": 6,
    "4º Lugar": 4,
  } as Record<FaseClassificacao, number>,
  ARTILHEIRO: 15,
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
