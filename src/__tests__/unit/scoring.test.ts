import { describe, it, expect } from "vitest";
import {
  calcularPontosPartida,
  calcularPontosArtilheiro,
  calcularPontosChaveamento,
  calcularRanking,
} from "@/lib/scoring";
import type {
  ApostaArtilheiro,
  Perfil,
  Aposta,
  PrevisaoChaveamento,
  ResultadoChaveamentoOficial,
} from "@/lib/types";

// ─── calcularPontosPartida ────────────────────────────────────────────────────

describe("calcularPontosPartida", () => {
  it("retorna 10 pts para placar exato (vitória)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 2, gols_time_b: 1 },
        { gols_a: 2, gols_b: 1 },
      ),
    ).toEqual({ pontos_placar: 10, pontos_resultado: 0, pontos_total: 10 });
  });

  it("retorna 10 pts para placar exato (empate)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 0, gols_time_b: 0 },
        { gols_a: 0, gols_b: 0 },
      ),
    ).toEqual({ pontos_placar: 10, pontos_resultado: 0, pontos_total: 10 });
  });

  it("retorna 5 pts para resultado correto (vitória com placar diferente)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 3, gols_time_b: 0 },
        { gols_a: 1, gols_b: 0 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 5, pontos_total: 5 });
  });

  it("retorna 5 pts para resultado correto (empate com placar diferente)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 1, gols_time_b: 1 },
        { gols_a: 2, gols_b: 2 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 5, pontos_total: 5 });
  });

  it("retorna 5 pts para resultado correto (derrota com placar diferente)", () => {
    expect(
      calcularPontosPartida(
        { gols_time_a: 0, gols_time_b: 2 },
        { gols_a: 0, gols_b: 1 },
      ),
    ).toEqual({ pontos_placar: 0, pontos_resultado: 5, pontos_total: 5 });
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
});

// ─── calcularPontosArtilheiro ─────────────────────────────────────────────────

describe("calcularPontosArtilheiro", () => {
  const aposta = { user_id: "u1", jogador_id: 99 } as ApostaArtilheiro;

  it("retorna 15 pts quando acertou o artilheiro", () => {
    expect(calcularPontosArtilheiro(aposta, 99)).toBe(15);
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

// ─── calcularPontosChaveamento ────────────────────────────────────────────────

describe("calcularPontosChaveamento", () => {
  it("retorna 0 quando não há resultados oficiais", () => {
    const previsoes: PrevisaoChaveamento[] = [
      {
        user_id: "u1",
        fase: "Final",
        slot: 1,
        pais_id: 1,
      } as PrevisaoChaveamento,
    ];
    expect(calcularPontosChaveamento(previsoes, [])).toBe(0);
  });

  it("retorna 10 pts por caminho exato (mesmo slot)", () => {
    const previsoes: PrevisaoChaveamento[] = [
      {
        user_id: "u1",
        fase: "Final",
        slot: 1,
        pais_id: 1,
      } as PrevisaoChaveamento,
    ];
    const oficiais: ResultadoChaveamentoOficial[] = [
      { fase: "Final", slot: 1, pais_id: 1 } as ResultadoChaveamentoOficial,
    ];
    expect(calcularPontosChaveamento(previsoes, oficiais)).toBe(10);
  });

  it("retorna 3 pts quando time avançou mas por slot diferente", () => {
    const previsoes: PrevisaoChaveamento[] = [
      {
        user_id: "u1",
        fase: "Semifinal",
        slot: 1,
        pais_id: 5,
      } as PrevisaoChaveamento,
    ];
    const oficiais: ResultadoChaveamentoOficial[] = [
      { fase: "Semifinal", slot: 1, pais_id: 7 } as ResultadoChaveamentoOficial,
      { fase: "Semifinal", slot: 2, pais_id: 5 } as ResultadoChaveamentoOficial,
    ];
    expect(calcularPontosChaveamento(previsoes, oficiais)).toBe(3);
  });

  it("retorna 0 pts quando time não avançou", () => {
    const previsoes: PrevisaoChaveamento[] = [
      {
        user_id: "u1",
        fase: "Final",
        slot: 1,
        pais_id: 99,
      } as PrevisaoChaveamento,
    ];
    const oficiais: ResultadoChaveamentoOficial[] = [
      { fase: "Final", slot: 1, pais_id: 1 } as ResultadoChaveamentoOficial,
    ];
    expect(calcularPontosChaveamento(previsoes, oficiais)).toBe(0);
  });
});

// ─── calcularRanking ──────────────────────────────────────────────────────────

describe("calcularRanking", () => {
  const perfis: Perfil[] = [
    { id: "u1", nome_completo: "Alice", email: "a@a.com" },
    { id: "u2", nome_completo: "Bob", email: "b@b.com" },
  ] as Perfil[];

  const apostas: Aposta[] = [
    { user_id: "u1", partida_id: 1, pontos_total: 10 },
    { user_id: "u1", partida_id: 2, pontos_total: 5 },
    { user_id: "u2", partida_id: 1, pontos_total: 0 },
  ] as Aposta[];

  it("ordena por pontos_total decrescente", () => {
    const ranking = calcularRanking(perfis, apostas, [], null);
    expect(ranking[0].user_id).toBe("u1");
    expect(ranking[0].pontos_total).toBe(15);
    expect(ranking[1].user_id).toBe("u2");
    expect(ranking[1].pontos_total).toBe(0);
  });

  it("atribui posições corretas", () => {
    const ranking = calcularRanking(perfis, apostas, [], null);
    expect(ranking[0].posicao).toBe(1);
    expect(ranking[1].posicao).toBe(2);
  });

  it("soma pontos de palpites, chaveamento e artilheiro", () => {
    const artilheiro = [{ user_id: "u1", jogador_id: 7 }] as ApostaArtilheiro[];
    const ranking = calcularRanking(perfis, apostas, artilheiro, 7);
    const alice = ranking.find((r) => r.user_id === "u1")!;
    expect(alice.pontos_palpites).toBe(15);
    expect(alice.pontos_artilheiro).toBe(15);
    expect(alice.pontos_total).toBe(30);
  });
});
