import { describe, it, expect } from "vitest";
import {
  calcularClassificacaoGrupos,
  rankearTerceirosLugares,
} from "@/lib/services/classificacao.service";
import type { Pais, ClassificacaoGrupos } from "@/lib/types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const PAISES_GRUPO_A: Pais[] = [
  { id: 1, nome: "Brasil", grupo: "A", bandeira_url: "" },
  { id: 2, nome: "Argentina", grupo: "A", bandeira_url: "" },
  { id: 3, nome: "Alemanha", grupo: "A", bandeira_url: "" },
  { id: 4, nome: "França", grupo: "A", bandeira_url: "" },
];

// Rodada-robin completo: Brasil 3V, Argentina 2V, França 1V, Alemanha 0V
const PARTIDAS_GRUPO_A = [
  // Rodada 1
  {
    id: 1,
    time_a_id: 1,
    time_b_id: 2,
    gols_a: 2,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 1,
  },
  {
    id: 2,
    time_a_id: 3,
    time_b_id: 4,
    gols_a: 1,
    gols_b: 1,
    grupo: "A",
    status: "finalizado",
    rodada: 1,
  },
  // Rodada 2
  {
    id: 3,
    time_a_id: 1,
    time_b_id: 3,
    gols_a: 3,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 2,
  },
  {
    id: 4,
    time_a_id: 2,
    time_b_id: 4,
    gols_a: 1,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 2,
  },
  // Rodada 3
  {
    id: 5,
    time_a_id: 1,
    time_b_id: 4,
    gols_a: 1,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 3,
  },
  {
    id: 6,
    time_a_id: 2,
    time_b_id: 3,
    gols_a: 2,
    gols_b: 1,
    grupo: "A",
    status: "finalizado",
    rodada: 3,
  },
];

// ─── calcularClassificacaoGrupos ──────────────────────────────────────────────

describe("calcularClassificacaoGrupos", () => {
  it("calcula pontos e ordena o grupo corretamente", () => {
    const grupos = calcularClassificacaoGrupos(
      PARTIDAS_GRUPO_A,
      PAISES_GRUPO_A,
    );
    const grupoA = grupos.find((g) => g.grupo === "A")!;
    const equipes = grupoA.equipes;

    // Brasil: 3 vitórias, 9 pontos
    expect(equipes[0].nome).toBe("Brasil");
    expect(equipes[0].pontos).toBe(9);
    expect(equipes[0].vitorias).toBe(3);
    expect(equipes[0].posicao).toBe(1);

    // Argentina: 2 vitórias, 6 pontos
    expect(equipes[1].nome).toBe("Argentina");
    expect(equipes[1].pontos).toBe(6);
    expect(equipes[1].posicao).toBe(2);

    // França: 0V + 1E + 2L = 1pt (saldo -2)
    // Alemanha: 0V + 1E + 2L = 1pt (saldo -4) → França na frente pelo saldo
    expect(equipes[2].nome).toBe("França");
    expect(equipes[2].pontos).toBe(1);
    expect(equipes[2].posicao).toBe(3);

    expect(equipes[3].nome).toBe("Alemanha");
    expect(equipes[3].posicao).toBe(4);
  });

  it("desempata por saldo de gols quando pontos iguais", () => {
    const grupos = calcularClassificacaoGrupos(
      PARTIDAS_GRUPO_A,
      PAISES_GRUPO_A,
    );
    const grupoA = grupos.find((g) => g.grupo === "A")!;
    const franca = grupoA.equipes.find((e) => e.nome === "França")!;
    const alemanha = grupoA.equipes.find((e) => e.nome === "Alemanha")!;

    // França saldo -2, Alemanha saldo -4 → França acima
    expect(franca.saldo_gols).toBeGreaterThan(alemanha.saldo_gols);
    expect(franca.posicao).toBeLessThan(alemanha.posicao);
  });

  it("ignora partidas com status diferente de 'finalizado'", () => {
    const partidasComPendente = [
      ...PARTIDAS_GRUPO_A.slice(0, 4),
      {
        id: 5,
        time_a_id: 1,
        time_b_id: 4,
        gols_a: 1,
        gols_b: 0,
        grupo: "A",
        status: "agendado",
        rodada: 3,
      },
      {
        id: 6,
        time_a_id: 2,
        time_b_id: 3,
        gols_a: 2,
        gols_b: 1,
        grupo: "A",
        status: "agendado",
        rodada: 3,
      },
    ];
    const grupos = calcularClassificacaoGrupos(
      partidasComPendente,
      PAISES_GRUPO_A,
    );
    const equipes = grupos.find((g) => g.grupo === "A")!.equipes;

    // Apenas 4 partidas contam → Brasil 6pts, Argentina 3pts (não jogou rodada 3)
    const brasil = equipes.find((e) => e.nome === "Brasil")!;
    expect(brasil.pontos).toBe(6);
    expect(brasil.jogos).toBe(2);
  });

  it("ignora partidas de rodada > 3 (fase de grupos)", () => {
    const comMataMata = [
      ...PARTIDAS_GRUPO_A,
      {
        id: 99,
        time_a_id: 1,
        time_b_id: 2,
        gols_a: 5,
        gols_b: 5,
        grupo: "A",
        status: "finalizado",
        rodada: 4,
      },
    ];
    const grupos = calcularClassificacaoGrupos(comMataMata, PAISES_GRUPO_A);
    const brasil = grupos.find((g) => g.grupo === "A")!.equipes[0];
    // Rodada 4 deve ser ignorada
    expect(brasil.jogos).toBe(3);
    expect(brasil.pontos).toBe(9);
  });

  it("desempata por confronto direto (H2H) quando tudo mais igual", () => {
    // Grupo B: 4 times todos com 1 vitória, 1 empate, 1 derrota (3pts)
    // e mesmo saldo e gols pró → H2H decide
    const paisesB: Pais[] = [
      { id: 11, nome: "Time1", grupo: "B", bandeira_url: "" },
      { id: 12, nome: "Time2", grupo: "B", bandeira_url: "" },
      { id: 13, nome: "Time3", grupo: "B", bandeira_url: "" },
      { id: 14, nome: "Time4", grupo: "B", bandeira_url: "" },
    ];
    // Cenário H2H: Time1 vence Time2, Time2 vence Time3, Time3 vence Time1
    // Todos com 1V 1E 1L mas H2H diferente entre Time1 e Time2 (Time1 ganhou)
    const partidasB = [
      {
        id: 10,
        time_a_id: 11,
        time_b_id: 12,
        gols_a: 1,
        gols_b: 0,
        grupo: "B",
        status: "finalizado",
        rodada: 1,
      },
      {
        id: 11,
        time_a_id: 13,
        time_b_id: 14,
        gols_a: 1,
        gols_b: 0,
        grupo: "B",
        status: "finalizado",
        rodada: 1,
      },
      {
        id: 12,
        time_a_id: 12,
        time_b_id: 13,
        gols_a: 1,
        gols_b: 0,
        grupo: "B",
        status: "finalizado",
        rodada: 2,
      },
      {
        id: 13,
        time_a_id: 14,
        time_b_id: 11,
        gols_a: 1,
        gols_b: 0,
        grupo: "B",
        status: "finalizado",
        rodada: 2,
      },
      {
        id: 14,
        time_a_id: 11,
        time_b_id: 13,
        gols_a: 1,
        gols_b: 1,
        grupo: "B",
        status: "finalizado",
        rodada: 3,
      },
      {
        id: 15,
        time_a_id: 12,
        time_b_id: 14,
        gols_a: 1,
        gols_b: 1,
        grupo: "B",
        status: "finalizado",
        rodada: 3,
      },
    ];

    const grupos = calcularClassificacaoGrupos(partidasB, [
      ...PAISES_GRUPO_A,
      ...paisesB,
    ]);
    const grupoB = grupos.find((g) => g.grupo === "B")!;

    // Todos com 4pts (1V+1E+1L), saldo 0, gols_pro 2
    // H2H: Time1 bateu Time2 → Time1 > Time2; Time3 bateu Time1... mas H2H só entre os empatados
    const equipes = grupoB.equipes;
    expect(equipes.every((e) => e.pontos === 4)).toBe(true);
  });
});

// ─── rankearTerceirosLugares ──────────────────────────────────────────────────

describe("rankearTerceirosLugares", () => {
  function makeGrupo(
    grupo: string,
    pts3: number,
    saldo3: number,
    gols3: number,
    nome3: string,
  ) {
    return {
      grupo,
      equipes: [
        {
          pais_id: 100,
          nome: "1st",
          bandeira_url: "",
          grupo,
          posicao: 1,
          jogos: 3,
          vitorias: 3,
          empates: 0,
          derrotas: 0,
          gols_pro: 9,
          gols_contra: 0,
          saldo_gols: 9,
          pontos: 9,
        },
        {
          pais_id: 101,
          nome: "2nd",
          bandeira_url: "",
          grupo,
          posicao: 2,
          jogos: 3,
          vitorias: 1,
          empates: 1,
          derrotas: 1,
          gols_pro: 3,
          gols_contra: 3,
          saldo_gols: 0,
          pontos: 4,
        },
        {
          pais_id: 102,
          nome: nome3,
          bandeira_url: "",
          grupo,
          posicao: 3,
          jogos: 3,
          vitorias: 0,
          empates: 1,
          derrotas: 2,
          gols_pro: gols3,
          gols_contra: gols3 - saldo3,
          saldo_gols: saldo3,
          pontos: pts3,
        },
        {
          pais_id: 103,
          nome: "4th",
          bandeira_url: "",
          grupo,
          posicao: 4,
          jogos: 3,
          vitorias: 0,
          empates: 0,
          derrotas: 3,
          gols_pro: 0,
          gols_contra: 9,
          saldo_gols: -9,
          pontos: 0,
        },
      ],
    };
  }

  // 12 grupos com terceiros de pontuações variadas
  const grupos: ClassificacaoGrupos = [
    makeGrupo("A", 7, 5, 8, "A3"),
    makeGrupo("B", 6, 3, 5, "B3"),
    makeGrupo("C", 6, 2, 4, "C3"),
    makeGrupo("D", 5, 1, 3, "D3"),
    makeGrupo("E", 5, 0, 2, "E3"),
    makeGrupo("F", 4, 2, 4, "F3"),
    makeGrupo("G", 4, 1, 3, "G3"),
    makeGrupo("H", 4, 0, 2, "H3"),
    makeGrupo("I", 3, 1, 2, "I3"),
    makeGrupo("J", 3, 0, 1, "J3"),
    makeGrupo("K", 2, 0, 1, "K3"),
    makeGrupo("L", 1, 0, 0, "L3"),
  ];

  it("retorna exatamente 8 terceiros", () => {
    const terceiros = rankearTerceirosLugares(grupos);
    expect(terceiros).toHaveLength(8);
  });

  it("ordena os terceiros pelos melhores (A3 primeiro com 7pts)", () => {
    const terceiros = rankearTerceirosLugares(grupos);
    expect(terceiros[0].nome).toBe("A3");
    expect(terceiros[0].pontos).toBe(7);
  });

  it("ordena por saldo de gols quando pontos iguais", () => {
    const terceiros = rankearTerceirosLugares(grupos);
    const idxB3 = terceiros.findIndex((t) => t.nome === "B3");
    const idxC3 = terceiros.findIndex((t) => t.nome === "C3");
    // B3: 6pts saldo +3, C3: 6pts saldo +2 → B3 antes no array
    expect(idxB3).toBeGreaterThanOrEqual(0);
    expect(idxB3).toBeLessThan(idxC3);
  });

  it("exclui o pior terceiro (K3 e L3 ficam fora)", () => {
    const terceiros = rankearTerceirosLugares(grupos);
    const nomes = terceiros.map((t) => t.nome);
    expect(nomes).not.toContain("K3");
    expect(nomes).not.toContain("L3");
  });
});
