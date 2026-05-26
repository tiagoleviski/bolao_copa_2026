// 2026-06-11 16:00 BRT (19:00 UTC) — primeiro jogo da Copa
export const PRAZO_ARTILHEIRO = new Date("2026-06-11T19:00:00Z");

export const PRAZO_PREVISOES = PRAZO_ARTILHEIRO;

export const MINUTOS_ANTES_FECHAMENTO = 0;

export const PONTUACAO = {
  PLACAR_EXATO: 10,
  RESULTADO_CORRETO: 5,
  RESULTADO_ERRADO: 0,
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

// ─── Chaveamento Copa 2026 ────────────────────────────────────────────────────

// Seeding do bracket: slot da "Segunda Fase" → [descriptor_timeA, descriptor_timeB]
// Formato: "1A" = 1° do Grupo A, "2B" = 2° do Grupo B, "T1"..T8 = melhores terceiros
// Slots 1-8 → lado esquerdo do bracket; slots 9-16 → lado direito
export const BRACKET_SEEDING: Record<number, [string, string]> = {
  1: ["1A", "2B"],
  2: ["1C", "2D"],
  3: ["1E", "2F"],
  4: ["1G", "T1"],
  5: ["1B", "2A"],
  6: ["1D", "2C"],
  7: ["1F", "T2"],
  8: ["1H", "2G"],
  9: ["1I", "2J"],
  10: ["1K", "T3"],
  11: ["1J", "2I"],
  12: ["1L", "T4"],
  13: ["2E", "T5"],
  14: ["2H", "T6"],
  15: ["2K", "T7"],
  16: ["2L", "T8"],
};

// Para cada slot das fases seguintes, quais são os slots pais (fonte dos dois times)
export const BRACKET_PARENTS: Record<
  string,
  { faseAnterior: string; slots: [number, number] }
> = {
  // Oitavas: slot → dois slots da Segunda Fase
  "Oitavas de Final:1": { faseAnterior: "Segunda Fase", slots: [1, 2] },
  "Oitavas de Final:2": { faseAnterior: "Segunda Fase", slots: [3, 4] },
  "Oitavas de Final:3": { faseAnterior: "Segunda Fase", slots: [5, 6] },
  "Oitavas de Final:4": { faseAnterior: "Segunda Fase", slots: [7, 8] },
  "Oitavas de Final:5": { faseAnterior: "Segunda Fase", slots: [9, 10] },
  "Oitavas de Final:6": { faseAnterior: "Segunda Fase", slots: [11, 12] },
  "Oitavas de Final:7": { faseAnterior: "Segunda Fase", slots: [13, 14] },
  "Oitavas de Final:8": { faseAnterior: "Segunda Fase", slots: [15, 16] },
  // Quartas
  "Quartas de Final:1": { faseAnterior: "Oitavas de Final", slots: [1, 2] },
  "Quartas de Final:2": { faseAnterior: "Oitavas de Final", slots: [3, 4] },
  "Quartas de Final:3": { faseAnterior: "Oitavas de Final", slots: [5, 6] },
  "Quartas de Final:4": { faseAnterior: "Oitavas de Final", slots: [7, 8] },
  // Semi
  "Semifinal:1": { faseAnterior: "Quartas de Final", slots: [1, 2] },
  "Semifinal:2": { faseAnterior: "Quartas de Final", slots: [3, 4] },
  // Final e 3° lugar
  "Final:1": { faseAnterior: "Semifinal", slots: [1, 2] },
  "Terceiro Lugar:1": { faseAnterior: "Semifinal", slots: [1, 2] },
};

export const PONTUACAO_CHAVEAMENTO = {
  CAMINHO_EXATO: 10,
  AVANCOU: 3,
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
