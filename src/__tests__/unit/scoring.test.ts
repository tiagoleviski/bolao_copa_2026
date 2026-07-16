import { describe, it, expect } from "vitest";
import {
  calcularPontosPartida,
  calcularPontosArtilheiro,
  calcularPontosPodio,
  calcularPontosGrupo,
  calcularPontoPrevisaoGrupo,
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
  it("retorna 3 pts para placar exato (vitória)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 2, gols_time_b: 1 },
        { gols_a: 2, gols_b: 1 },
      ),
    ).toEqual({ pontos_placar: 3, pontos_resultado: 0, pontos_total: 3 });
  });

  it("retorna 3 pts para placar exato (empate)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 0, gols_time_b: 0 },
        { gols_a: 0, gols_b: 0 },
      ),
    ).toEqual({ pontos_placar: 3, pontos_resultado: 0, pontos_total: 3 });
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

  it("não soma placar exato + resultado (máximo é 3)", () => {
    const result = calcularPontosPartida(
      { gols_time_a: 2, gols_time_b: 1 },
      { gols_a: 2, gols_b: 1 },
    );
    expect(result.pontos_total).toBe(3);
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

  it("retorna 20 pts quando artilheiro empatado e aposta é um deles", () => {
    expect(calcularPontosArtilheiro(aposta, [99, 50])).toBe(20);
  });

  it("retorna 20 pts quando artilheiro empatado e aposta é o segundo", () => {
    const aposta2 = { user_id: "u2", jogador_id: 50 } as ApostaArtilheiro;
    expect(calcularPontosArtilheiro(aposta2, [99, 50])).toBe(20);
  });

  it("retorna 0 pts quando artilheiro empatado e aposta não é nenhum", () => {
    expect(calcularPontosArtilheiro(aposta, [50, 60])).toBe(0);
  });

  it("retorna 0 pts quando lista de artilheiros é vazia", () => {
    expect(calcularPontosArtilheiro(aposta, [])).toBe(0);
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

  it("retorna 40 pts: campeão certo + 2 times no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 20 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(40);
  });

  it("retorna 35 pts: campeão certo + 1 time no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(35);
  });

  it("retorna 30 pts: só campeão certo, nenhum outro no pódio", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 88 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(30);
  });

  it("retorna 10 pts: campeão errado + 2 times no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 99 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 20 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(10);
  });

  it("retorna 5 pts: campeão errado + 1 time no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 99 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 30 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 88 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(5);
  });

  it("retorna 0 pts: nenhum time no pódio", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 77 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 88 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(0);
  });

  it("retorna 50 pts: campeão e vice certos", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 10 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 20 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 99 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(50);
  });

  it("retorna 20 pts: só vice certo", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 99 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 20 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 88 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(20);
  });

  it("retorna 10 pts: só terceiro certo", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 99 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 88 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 30 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(10);
  });

  it("retorna 25 pts: vice certo + terceiro no pódio fora de posição", () => {
    const aposta: ApostaPodio[] = [
      { id: 1, user_id: "u1", posicao: 1, pais_id: 99 },
      { id: 2, user_id: "u1", posicao: 2, pais_id: 20 },
      { id: 3, user_id: "u1", posicao: 3, pais_id: 10 },
    ];
    expect(calcularPontosPodio(aposta, podioOficial)).toBe(25);
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
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(0);
  });

  it("retorna 0 pts se previu 3º avançando mas oficialmente 3º não avançou", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 3, terceiro_avanca: true },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 3, terceiro_avancou: false },
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(0);
  });

  it("retorna 2 pts se previu 3º avançando e oficialmente 3º avançou", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 3, terceiro_avanca: true },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 3, terceiro_avancou: true },
    ];
    expect(calcularPontosGrupo(previsoes, oficiais)).toBe(2);
  });

  it("retorna 2 pts se previu 4º e oficialmente 4º", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 4, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 4, terceiro_avancou: false },
    ];
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

// ─── calcularPontoPrevisaoGrupo (detalhe por palpite) ────────────────────────

describe("calcularPontoPrevisaoGrupo", () => {
  it("status 'exata' (+2) quando a posição bate", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        { posicao: 1, terceiro_avancou: false },
        true,
      ),
    ).toEqual({ pontos: 2, status: "exata" });
  });

  it("status 'passou' (+1) quando ambos avançaram em posições diferentes", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        { posicao: 2, terceiro_avancou: false },
        true,
      ),
    ).toEqual({ pontos: 1, status: "passou" });
  });

  it("status 'errou' (0) quando previu avanço mas o país não avançou", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        { posicao: 4, terceiro_avancou: false },
        true,
      ),
    ).toEqual({ pontos: 0, status: "errou" });
  });

  it("status 'errou' (0) no grupo decidido quando não há entrada oficial (país eliminado)", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 2, terceiro_avanca: false },
        undefined,
        true,
      ),
    ).toEqual({ pontos: 0, status: "errou" });
  });

  it("status 'pendente' (0) quando o grupo ainda não foi decidido", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        undefined,
        false,
      ),
    ).toEqual({ pontos: 0, status: "pendente" });
  });

  it("3º previsto avançando que oficialmente não avançou → 'errou'", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 3, terceiro_avanca: true },
        { posicao: 3, terceiro_avancou: false },
        true,
      ),
    ).toEqual({ pontos: 0, status: "errou" });
  });

  it("3º previsto avançando e oficialmente avançou → 'exata' (+2)", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 3, terceiro_avanca: true },
        { posicao: 3, terceiro_avancou: true },
        true,
      ),
    ).toEqual({ pontos: 2, status: "exata" });
  });

  it("palpite de 3º sem avanço fica 'pendente' enquanto os 8 terceiros não foram definidos", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 3, terceiro_avanca: true },
        undefined,
        true,
        false,
      ),
    ).toEqual({ pontos: 0, status: "pendente" });
  });

  it("palpite de 3º vira 'errou' depois que os 8 terceiros foram definidos", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 3, terceiro_avanca: true },
        undefined,
        true,
        true,
      ),
    ).toEqual({ pontos: 0, status: "errou" });
  });

  it("palpite de 3º cujo time passou em 1º/2º pontua 'passou' mesmo sem os 8 terceiros definidos", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 3, terceiro_avanca: true },
        { posicao: 2, terceiro_avancou: false },
        true,
        false,
      ),
    ).toEqual({ pontos: 1, status: "passou" });
  });

  it("palpite de 1º/2º fica 'pendente' até os 8 terceiros (time pode avançar como 3º)", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        undefined,
        true,
        false,
      ),
    ).toEqual({ pontos: 0, status: "pendente" });
  });

  it("palpite de 1º/2º vira 'errou' depois que os 8 terceiros foram definidos", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 2, terceiro_avanca: false },
        undefined,
        true,
        true,
      ),
    ).toEqual({ pontos: 0, status: "errou" });
  });

  it("palpite de 1º cujo time avançou como 3º pontua 'passou' (+1)", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        { posicao: 3, terceiro_avancou: true },
        true,
        true,
      ),
    ).toEqual({ pontos: 1, status: "passou" });
  });

  it("zera o palpite errado assim que o grupo é resolvido, sem esperar os 8 terceiros", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        undefined,
        true,
        false, // 8 terceiros globais ainda não definidos
        true, // mas este grupo já está totalmente resolvido
      ),
    ).toEqual({ pontos: 0, status: "errou" });
  });

  it("sem grupo resolvido e sem os 8 terceiros, o palpite errado segue 'pendente'", () => {
    expect(
      calcularPontoPrevisaoGrupo(
        { posicao: 1, terceiro_avanca: false },
        undefined,
        true,
        false,
        false,
      ),
    ).toEqual({ pontos: 0, status: "pendente" });
  });

  it("subtotal de um grupo bate com a soma do helper agregado", () => {
    const previsoes: PrevisaoGrupo[] = [
      { id: 1, user_id: "u1", pais_id: 1, posicao: 1, terceiro_avanca: false },
      { id: 2, user_id: "u1", pais_id: 2, posicao: 2, terceiro_avanca: false },
    ];
    const oficiais: PosicaoOficialGrupo[] = [
      { id: 1, pais_id: 1, posicao: 1, terceiro_avancou: false }, // exata +2
      { id: 2, pais_id: 2, posicao: 1, terceiro_avancou: false }, // passou +1
    ];
    const oficialMap = new Map(oficiais.map((o) => [o.pais_id, o]));
    const subtotal = previsoes.reduce(
      (acc, p) =>
        acc +
        calcularPontoPrevisaoGrupo(p, oficialMap.get(p.pais_id), true).pontos,
      0,
    );
    expect(subtotal).toBe(calcularPontosGrupo(previsoes, oficiais));
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

  it("conta cravadas (pontos_placar > 0) por usuário", () => {
    const apostasComCravada: Aposta[] = [
      { user_id: "u1", partida_id: 1, pontos_placar: 3, pontos_total: 3 },
      { user_id: "u1", partida_id: 2, pontos_placar: 0, pontos_total: 1 },
      { user_id: "u2", partida_id: 1, pontos_placar: 3, pontos_total: 3 },
      { user_id: "u2", partida_id: 2, pontos_placar: 3, pontos_total: 3 },
    ] as Aposta[];
    const ranking = calcularRanking(perfis, apostasComCravada, [], null);
    const alice = ranking.find((r) => r.user_id === "u1")!;
    const bob = ranking.find((r) => r.user_id === "u2")!;
    expect(alice.cravadas).toBe(1);
    expect(bob.cravadas).toBe(2);
  });

  it("usa cravadas como critério de desempate", () => {
    const apostasEmpate: Aposta[] = [
      { user_id: "u1", partida_id: 1, pontos_placar: 3, pontos_total: 3 },
      { user_id: "u2", partida_id: 1, pontos_placar: 0, pontos_total: 3 },
    ] as Aposta[];
    const ranking = calcularRanking(perfis, apostasEmpate, [], null);
    expect(ranking[0].user_id).toBe("u1");
    expect(ranking[1].user_id).toBe("u2");
  });

  it("retorna posicao_anterior do snapshot quando fornecido", () => {
    const snapshot = new Map([["u1", 3]]);
    const ranking = calcularRanking(
      perfis,
      apostas,
      [],
      null,
      [],
      [],
      [],
      [],
      snapshot,
    );
    const alice = ranking.find((r) => r.user_id === "u1")!;
    expect(alice.posicao_anterior).toBe(3);
  });

  it("retorna posicao_anterior null quando não há snapshot", () => {
    const ranking = calcularRanking(perfis, apostas, [], null);
    expect(ranking[0].posicao_anterior).toBeNull();
  });
});
