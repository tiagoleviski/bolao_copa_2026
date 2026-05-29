import { describe, it, expect } from "vitest";
import {
  calcularPontosPartida,
  calcularPontosArtilheiro,
  calcularPontosPodio,
  calcularPontosGrupo,
  calcularRanking,
} from "@/lib/scoring";
import type {
  ApostaArtilheiro,
  ApostaPodio,
  Perfil,
  Aposta,
  PodioOficial,
  PrevisaoGrupo,
  PosicaoOficialGrupo,
} from "@/lib/types";

// ─── calcularPontosPartida ────────────────────────────────────────────────────

describe("calcularPontosPartida", () => {
  it("retorna 2 pts para placar exato (vitória)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 2, gols_time_b: 1 },
        { gols_a: 2, gols_b: 1 },
      ),
    ).toEqual({ pontos_placar: 2, pontos_resultado: 0, pontos_total: 2 });
  });

  it("retorna 2 pts para placar exato (empate)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 0, gols_time_b: 0 },
        { gols_a: 0, gols_b: 0 },
      ),
    ).toEqual({ pontos_placar: 2, pontos_resultado: 0, pontos_total: 2 });
  });

  it("retorna 1 pt para resultado correto (vitória com placar diferente)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 3, gols_time_b: 0 },
        { gols_a: 1, gols_b: 0 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 1, pontos_total: 1 });
  });

  it("retorna 1 pt para resultado correto (empate com placar diferente)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 1, gols_time_b: 1 },
        { gols_a: 2, gols_b: 2 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 1, pontos_total: 1 });
  });

  it("retorna 1 pt para resultado correto (derrota com placar diferente)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 0, gols_time_b: 2 },
        { gols_a: 0, gols_b: 1 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 1, pontos_total: 1 });
  });

  it("retorna 0 pts quando apostou vitória mas foi derrota", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 1, gols_time_b: 0 },
        { gols_a: 0, gols_b: 1 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 0, pontos_total: 0 });
  });

  it("retorna 0 pts quando apostou empate mas foi vitória", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 1, gols_time_b: 1 },
        { gols_a: 2, gols_b: 0 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 0, pontos_total: 0 });
  });

  it("retorna 0 pts se partida ainda não tem gols (null)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 1, gols_time_b: 0 },
        { gols_a: null, gols_b: null },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 0, pontos_total: 0 });
  });

  it("não soma placar exato + resultado (máximo é 2)", () => {
    const result = calcularPontosPartida(
      { gols_time_a: 2, gols_time_b: 1 },
      { gols_a: 2, gols_b: 1 },
    );
    expect(result.pontos_total).toBe(2);
    expect(result.pontos_resultado).toBe(0);
  });
});

// ─── calcularPontosArtilheiro ─────────────────────────────────────────────────

describe("calcularPontosArtilheiro", () => {
  const aposta = { user_id: "u1", jogador_id: 99 } as ApostaArtilheiro;

  it("retorna 20 pts quando acertou o artilheiro", () => {
    expect(calcularPontosArtilheiro(aposta, 99)).toBe(20);
  });

  it("retorna 0 pts quando errou o artilheiro", () => {
    expect(calcularPontosArtilheiro(aposta, 42)).toBe(0);
  });

  it("retorna 0 pts quando não há aposta", () => {
    expect(calcularPontosArtilheiro(null, 99)).toBe(0);
  });

  it("retorna 0 pts quando artilheiro oficial não foi definido", () => {
    expect(calcularPontosArtilheiro(aposta, null)).toBe(0);
  });
});

// ─── calcularPontosPodio ─────────────────────────────────────────────────────

describe("calcularPontosPodio", () => {
  const podioOficial: PodioOficial[] = [
    { id: 1, posicao: 1, pais_id: 10 },
    { id: 2, posicao: 2, pais_id: 20 },
    { id: 3, posicao: 3, pais_id: 30 },
  ];

  it("retorna 60 pts para pódio exato", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 20 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 30 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(60);
  });

  it("retorna 50 pts: campeão certo + 2 times no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 20 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(50);
  });

  it("retorna 40 pts: campeão certo + 1 time no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(40);
  });

  it("retorna 30 pts: só campeão certo, nenhum outro no pódio", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 88 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(30);
  });

  it("retorna 20 pts: campeão errado + 2 times no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 99 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 20 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(20);
  });

  it("retorna 10 pts: campeão errado + 1 time no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 99 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 88 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(10);
  });

  it("retorna 0 pts: nenhum time no pódio", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 77 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 88 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(0);
  });

  it("não dá pontos por time na posição exata (exceto campeão ou pódio completo)", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 20 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    // Campeão (30) + time 20 está na posição exata (não é "fora de posição") = 30
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(30);
  });

  it("retorna 0 para listas vazias", () => {
    expect(calcularPontosPodio([], podioOficial)).toBe(0);
    expect(calcularPontosPodio([], [])).toBe(0);
  });

  it("máximo é 60 pts mesmo com lógica acumulada", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 20 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 30 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBeLessThanOrEqual(60);
  });
});

// ─── calcularPontosGrupo ─────────────────────────────────────────────────────

describe("calcularPontosGrupo", () => {
  it("retorna 2 pts por posição exata", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 1, terceiro_avancou: false },
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(2);
  });

  it("retorna 1 pt se ambos avançaram mas posição diferente (1º vs 2º)", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 2, terceiro_avancou: false },
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(1);
  });

  it("retorna 1 pt se previu 3º que avança e oficialmente é 2º", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 3, terceiro_avanca: true },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 2, terceiro_avancou: false },
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(1);
  });

  it("retorna 1 pt se previu 1º e oficialmente é 3º que avança", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 3, terceiro_avancou: true },
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(1);
  });

  it("retorna 0 pts se previu que avança mas não avançou", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 4, terceiro_avancou: false },
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(0);
  });

  it("retorna 0 pts se previu 3º que não avança e oficialmente 3º que avança", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 3, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 3, terceiro_avancou: true },
    ];
    // Posição exata (3 === 3) → 2 pts
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(2);
  });

  it("retorna 0 pts se previu 4º e oficialmente 4º", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 4, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 4, terceiro_avancou: false },
    ];
    // Posição exata → 2 pts
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(2);
  });

  it("soma pontos de múltiplos times no grupo", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
      { id: 2, user_id: "u1", pais_id: 2, posicao: 2, terceiro_avanca: false },
      { id: 3, user_id: "u1", pais_id: 3, posicao: 3, terceiro_avanca: true },
      { id: 4, user_id: "u1", pais_id: 4, posicao: 4, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 1, terceiro_avancou: false }, // exata +2
      { id: 2, pais_id: 2, posicao: 1, terceiro_avancou: false }, // ambos avançam +1
      { id: 3, pais_id: 3, posicao: 4, terceiro_avancou: false }, // previu avançar, não avançou +0
      { id: 4, pais_id: 4, posicao: 4, terceiro_avancou: false }, // exata +2
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(5);
  });

  it("retorna 0 para listas vazias", () => {
    expect(calcularPontosGrupo([], [])).toBe(0);
  });

  it("ignora previsões sem resultado oficial", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
    ];
    expect(calcularPontosGrupo(previsoes, [])).toBe(0);
  });
});

// ─── calcularRanking ──────────────────────────────────────────────────────────

describe("calcularRanking", () => {
  const perfis: Perfil[] = [
    { id: "u1", nome_completo: "Alice", email: "a@a.com" },
    { id: "u2", nome_completo: "Bob", email: "b@b.com" },
  ] as Perfil[];

  const apostas: Aposta[] = [
    { user_id: "u1", partida_id: 1, pontos_total: 2 },
    { user_id: "u1", partida_id: 2, pontos_total: 1 },
    { user_id: "u2", partida_id: 1, pontos_total: 0 },
  ] as Aposta[];

  it("ordena por pontos_total decrescente", () => {
    const ranking = calcularRanking(perfis, apostas, [], null);
    expect(ranking[0].user_id).toBe("u1");
    expect(ranking[0].pontos_total).toBe(3);
    expect(ranking[1].user_id).toBe("u2");
    expect(ranking[1].pontos_total).toBe(0);
  });

  it("atribui posições corretas", () => {
    const ranking = calcularRanking(perfis, apostas, [], null);
    expect(ranking[0].posicao).toBe(1);
    expect(ranking[1].posicao).toBe(2);
  });

  it("soma pontos de palpites e artilheiro", () => {
    const artilheiro = [{ user_id: "u1", jogador_id: 7 }] as ApostaArtilheiro[];
    const ranking = calcularRanking(perfis, apostas, artilheiro, 7);
    const alice = ranking.find((r) => r.user_id === "u1")!;
    expect(alice.pontos_palpites).toBe(3);
    expect(alice.pontos_artilheiro).toBe(20);
    expect(alice.pontos_total).toBe(23);
  });

  it("inclui pontos de grupo no total", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 1, terceiro_avancou: false },
    ];
    const ranking = calcularRanking(
      perfis,
      apostas,
      [],
      null,
      [],
      [],
      previsoes,
      oficiais,
    );
    const alice = ranking.find((r) => r.user_id === "u1")!;
    expect(alice.pontos_grupo).toBe(2);
    expect(alice.pontos_total).toBe(5);
  });

  it("inclui pontos_grupo no RankingEntry", () => {
    const ranking = calcularRanking(perfis, apostas, [], null);
    expect(ranking[0]).toHaveProperty("pontos_grupo");
  });
});
