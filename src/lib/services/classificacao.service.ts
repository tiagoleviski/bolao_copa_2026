import "server-only";

import type {
  Pais,
  ClassificacaoEquipe,
  ClassificacaoGrupo,
  ClassificacaoGrupos,
} from "@/lib/types";
import { GRUPOS } from "@/lib/constants";

interface PartidaGrupo {
  id: number;
  time_a_id: number;
  time_b_id: number;
  gols_a: number | null;
  gols_b: number | null;
  grupo: string | null;
  status: string;
  rodada: number;
}

function statsVazias(pais: Pais, grupo: string): ClassificacaoEquipe {
  return {
    pais_id: pais.id,
    nome: pais.nome,
    bandeira_url: pais.bandeira_url,
    grupo,
    posicao: 0,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    gols_pro: 0,
    gols_contra: 0,
    saldo_gols: 0,
    pontos: 0,
  };
}

function calcularH2H(
  equipeIds: number[],
  partidas: PartidaGrupo[],
): Map<number, { pontos: number; saldo: number; gols: number }> {
  const h2h = new Map(
    equipeIds.map((id) => [id, { pontos: 0, saldo: 0, gols: 0 }]),
  );

  for (const p of partidas) {
    if (
      !equipeIds.includes(p.time_a_id) ||
      !equipeIds.includes(p.time_b_id) ||
      p.status !== "finalizado" ||
      p.gols_a === null ||
      p.gols_b === null
    )
      continue;

    const a = h2h.get(p.time_a_id)!;
    const b = h2h.get(p.time_b_id)!;

    a.gols += p.gols_a;
    b.gols += p.gols_b;
    a.saldo += p.gols_a - p.gols_b;
    b.saldo += p.gols_b - p.gols_a;

    if (p.gols_a > p.gols_b) {
      a.pontos += 3;
    } else if (p.gols_a < p.gols_b) {
      b.pontos += 3;
    } else {
      a.pontos += 1;
      b.pontos += 1;
    }
  }

  return h2h;
}

function ordenarGrupo(
  equipes: ClassificacaoEquipe[],
  partidas: PartidaGrupo[],
): ClassificacaoEquipe[] {
  return [...equipes].sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.saldo_gols !== a.saldo_gols) return b.saldo_gols - a.saldo_gols;
    if (b.gols_pro !== a.gols_pro) return b.gols_pro - a.gols_pro;

    // H2H desempate entre times empatados nestes critérios
    const empatados = equipes
      .filter(
        (e) =>
          e.pontos === a.pontos &&
          e.saldo_gols === a.saldo_gols &&
          e.gols_pro === a.gols_pro,
      )
      .map((e) => e.pais_id);

    if (empatados.length > 1) {
      const h2h = calcularH2H(empatados, partidas);
      const ha = h2h.get(a.pais_id)!;
      const hb = h2h.get(b.pais_id)!;
      if (hb.pontos !== ha.pontos) return hb.pontos - ha.pontos;
      if (hb.saldo !== ha.saldo) return hb.saldo - ha.saldo;
      if (hb.gols !== ha.gols) return hb.gols - ha.gols;
    }

    return a.nome.localeCompare(b.nome);
  });
}

export function calcularClassificacaoGrupos(
  partidas: PartidaGrupo[],
  paises: Pais[],
): ClassificacaoGrupos {
  const resultado: ClassificacaoGrupos = [];

  for (const grupo of GRUPOS) {
    const paisesDoGrupo = paises.filter((p) => p.grupo === grupo);
    const statsMap = new Map<number, ClassificacaoEquipe>(
      paisesDoGrupo.map((p) => [p.id, statsVazias(p, grupo)]),
    );

    const partidasDoGrupo = partidas.filter(
      (p) => p.grupo === grupo && p.rodada <= 3,
    );

    for (const partida of partidasDoGrupo) {
      if (
        partida.status !== "finalizado" ||
        partida.gols_a === null ||
        partida.gols_b === null
      )
        continue;

      const eqA = statsMap.get(partida.time_a_id);
      const eqB = statsMap.get(partida.time_b_id);
      if (!eqA || !eqB) continue;

      eqA.jogos++;
      eqB.jogos++;
      eqA.gols_pro += partida.gols_a;
      eqA.gols_contra += partida.gols_b;
      eqB.gols_pro += partida.gols_b;
      eqB.gols_contra += partida.gols_a;
      eqA.saldo_gols = eqA.gols_pro - eqA.gols_contra;
      eqB.saldo_gols = eqB.gols_pro - eqB.gols_contra;

      if (partida.gols_a > partida.gols_b) {
        eqA.vitorias++;
        eqA.pontos += 3;
        eqB.derrotas++;
      } else if (partida.gols_a < partida.gols_b) {
        eqB.vitorias++;
        eqB.pontos += 3;
        eqA.derrotas++;
      } else {
        eqA.empates++;
        eqB.empates++;
        eqA.pontos++;
        eqB.pontos++;
      }
    }

    const equipes = ordenarGrupo(
      Array.from(statsMap.values()),
      partidasDoGrupo,
    );
    equipes.forEach((e, i) => (e.posicao = i + 1));

    resultado.push({ grupo, equipes });
  }

  return resultado;
}

export function rankearTerceirosLugares(
  classificacao: ClassificacaoGrupos,
): ClassificacaoEquipe[] {
  const terceiros = classificacao.map((g) => g.equipes[2]).filter(Boolean);

  return terceiros
    .sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      if (b.saldo_gols !== a.saldo_gols) return b.saldo_gols - a.saldo_gols;
      if (b.gols_pro !== a.gols_pro) return b.gols_pro - a.gols_pro;
      return a.nome.localeCompare(b.nome);
    })
    .slice(0, 8);
}
