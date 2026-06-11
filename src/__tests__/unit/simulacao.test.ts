import { describe, expect, it } from "vitest";
import {
  CENARIO_VAZIO,
  contarTerceirosSim,
  linhasGruposSim,
  linhasPodioSim,
  simularRanking,
  type GrupoSim,
  type SimuladorData,
} from "@/lib/simulacao";
import type { Perfil } from "@/lib/types";

const perfis: Perfil[] = [
  { id: "u1", nome_completo: "Alice", email: "a@a.com" },
  { id: "u2", nome_completo: "Bruno", email: "b@b.com" },
];

function baseData(overrides: Partial<SimuladorData> = {}): SimuladorData {
  return {
    perfis,
    palpitesBase: [
      { user_id: "u1", pontos: 10 },
      { user_id: "u2", pontos: 8 },
    ],
    partidasSimulaveis: [
      {
        id: 1,
        fase: "Grupos",
        status: "em_andamento",
        data_hora: "2026-06-11T19:00:00Z",
        gols_a: null,
        gols_b: null,
        time_a: { id: 100, nome: "México", bandeira_url: "" },
        time_b: { id: 101, nome: "África do Sul", bandeira_url: "" },
        apostas: [
          { user_id: "u1", gols_time_a: 2, gols_time_b: 0 }, // exato se 2x0
          { user_id: "u2", gols_time_a: 1, gols_time_b: 0 }, // só resultado
        ],
      },
    ],
    prazoPrevisoesEncerrado: true,
    gruposEncerrados: false,
    apostasPodio: [
      { id: 1, user_id: "u2", posicao: 1, pais_id: 7 },
      { id: 2, user_id: "u2", posicao: 2, pais_id: 8 },
      { id: 3, user_id: "u2", posicao: 3, pais_id: 9 },
    ],
    previsoesGrupo: [],
    apostasArtilheiro: [{ id: 1, user_id: "u1", jogador_id: 55 }],
    artilheiroOficialId: null,
    podioOficial: [],
    posicaoOficialGrupo: [],
    paises: [],
    jogadores: [],
    ...overrides,
  };
}

describe("simularRanking", () => {
  it("sem cenário, simulado == baseline", () => {
    const r = simularRanking(baseData(), CENARIO_VAZIO);
    expect(r.simulado).toEqual(r.baseline);
    expect(r.baseline[0].nome_completo).toBe("Alice"); // 10 > 8
  });

  it("placar simulado soma pontos do jogo em andamento (3 pts exato / 1 pt resultado)", () => {
    const r = simularRanking(baseData(), {
      ...CENARIO_VAZIO,
      partida: { partidaId: 1, golsA: 2, golsB: 0 },
    });
    const alice = r.simulado.find((e) => e.user_id === "u1")!;
    const bruno = r.simulado.find((e) => e.user_id === "u2")!;
    expect(alice.pontos_palpites).toBe(13); // 10 + 3 (placar exato)
    expect(bruno.pontos_palpites).toBe(9); // 8 + 1 (resultado)
  });

  it("pódio completo: pódio perfeito vale 60 e muda o líder", () => {
    const r = simularRanking(baseData(), {
      ...CENARIO_VAZIO,
      podio: { campeao: 7, vice: 8, terceiro: 9 },
    });
    const bruno = r.simulado.find((e) => e.user_id === "u2")!;
    expect(bruno.pontos_podio).toBe(60); // acertou as 3 posições
    expect(r.simulado[0].user_id).toBe("u2"); // ultrapassa Alice
    expect(r.posicaoBase.get("u2")).toBe(2); // era 2º no baseline
  });

  it("pódio parcial já pontua: só o campeão vale 30", () => {
    const r = simularRanking(baseData(), {
      ...CENARIO_VAZIO,
      podio: { campeao: 7, vice: null, terceiro: null },
    });
    const bruno = r.simulado.find((e) => e.user_id === "u2")!;
    expect(bruno.pontos_podio).toBe(30);
  });

  it("pódio parcial: seleção apostada em posição diferente vale 5", () => {
    // Bruno apostou país 8 como vice; simulamos país 8 como campeão
    const r = simularRanking(baseData(), {
      ...CENARIO_VAZIO,
      podio: { campeao: 8, vice: null, terceiro: null },
    });
    const bruno = r.simulado.find((e) => e.user_id === "u2")!;
    expect(bruno.pontos_podio).toBe(5);
  });

  it("artilheiro simulado dá 20 pts a quem apostou nele", () => {
    const r = simularRanking(baseData(), {
      ...CENARIO_VAZIO,
      artilheiroJogadorId: 55,
    });
    const alice = r.simulado.find((e) => e.user_id === "u1")!;
    expect(alice.pontos_artilheiro).toBe(20);
  });

  it("grupos parciais já pontuam: 1º exato vale 2 pts sem precisar completar", () => {
    const data = baseData({
      previsoesGrupo: [
        // Alice previu país 200 em 1º do grupo A
        { id: 1, user_id: "u1", pais_id: 200, posicao: 1, terceiro_avanca: false },
        // Bruno previu país 200 em 2º (classificou em posição diferente = 1 pt)
        { id: 2, user_id: "u2", pais_id: 200, posicao: 2, terceiro_avanca: false },
      ],
    });
    const r = simularRanking(data, {
      ...CENARIO_VAZIO,
      grupos: {
        A: { primeiro: 200, segundo: null, terceiro: null },
      },
    });
    const alice = r.simulado.find((e) => e.user_id === "u1")!;
    const bruno = r.simulado.find((e) => e.user_id === "u2")!;
    expect(alice.pontos_grupo).toBe(2); // posição exata
    expect(bruno.pontos_grupo).toBe(1); // avançou em posição diferente
  });

  it("3º selecionado conta como terceiro que avança", () => {
    const data = baseData({
      previsoesGrupo: [
        { id: 1, user_id: "u1", pais_id: 300, posicao: 3, terceiro_avanca: true },
      ],
    });
    const r = simularRanking(data, {
      ...CENARIO_VAZIO,
      grupos: {
        B: { primeiro: null, segundo: null, terceiro: 300 },
      },
    });
    const alice = r.simulado.find((e) => e.user_id === "u1")!;
    expect(alice.pontos_grupo).toBe(2); // posição exata no 3º que avançou
  });
});

describe("helpers", () => {
  it("linhasPodioSim gera linhas incrementais e ignora duplicados", () => {
    expect(linhasPodioSim({ campeao: 1, vice: 2, terceiro: 3 })).toHaveLength(3);
    expect(linhasPodioSim({ campeao: 1, vice: null, terceiro: null })).toEqual([
      { id: -1, posicao: 1, pais_id: 1 },
    ]);
    expect(linhasPodioSim({ campeao: 1, vice: 1, terceiro: null })).toHaveLength(1);
    expect(linhasPodioSim({ campeao: null, vice: null, terceiro: null })).toEqual([]);
  });

  it("linhasGruposSim gera linhas incrementais; 3º selecionado avança", () => {
    const grupos: Record<string, GrupoSim> = {
      A: { primeiro: 1, segundo: 2, terceiro: 3 },
      B: { primeiro: 4, segundo: null, terceiro: null },
      C: { primeiro: null, segundo: null, terceiro: null },
    };
    const rows = linhasGruposSim(grupos);
    expect(rows).toHaveLength(4); // A: 3 linhas | B: 1 | C: 0
    const terceiroA = rows.find((r) => r.pais_id === 3)!;
    expect(terceiroA.posicao).toBe(3);
    expect(terceiroA.terceiro_avancou).toBe(true);
    expect(contarTerceirosSim(grupos)).toBe(1);
  });
});
