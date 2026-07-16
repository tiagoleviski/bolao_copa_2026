import { calcularPontosPartida, calcularRanking } from "@/lib/scoring";
import type {
  Aposta,
  ApostaArtilheiro,
  ApostaPodio,
  Perfil,
  PodioOficial,
  PosicaoOficialGrupo,
  PrevisaoGrupo,
  RankingEntry,
} from "@/lib/types";

// ─── Tipos dos dados servidos por /api/v1/simulador ──────────────────────────

export interface PartidaSimulavel {
  id: number;
  fase: string;
  status: string;
  data_hora: string;
  gols_a: number | null;
  gols_b: number | null;
  time_a: { id: number; nome: string; bandeira_url: string };
  time_b: { id: number; nome: string; bandeira_url: string };
  apostas: { user_id: string; gols_time_a: number; gols_time_b: number }[];
}

export interface PaisSimulador {
  id: number;
  nome: string;
  grupo: string;
  bandeira_url: string;
  eliminado: boolean;
}

export interface JogadorSimulador {
  id: number;
  nome: string;
  pais: { id: number; nome: string; bandeira_url: string };
}

export interface SimuladorData {
  perfis: Perfil[];
  /** Soma de pontos_total das apostas de jogos por usuário (estado atual). */
  palpitesBase: { user_id: string; pontos: number }[];
  /** Jogos já iniciados e não finalizados, com os palpites de todos. */
  partidasSimulaveis: PartidaSimulavel[];
  prazoPrevisoesEncerrado: boolean;
  /** true quando todos os jogos da fase de grupos estão finalizados. */
  gruposEncerrados: boolean;
  apostasPodio: ApostaPodio[] | null;
  previsoesGrupo: PrevisaoGrupo[] | null;
  apostasArtilheiro: ApostaArtilheiro[] | null;
  artilheiroOficialIds: number[];
  podioOficial: PodioOficial[];
  posicaoOficialGrupo: PosicaoOficialGrupo[];
  paises: PaisSimulador[];
  jogadores: JogadorSimulador[];
}

// ─── Cenário montado pelo usuário ────────────────────────────────────────────

export interface CenarioPartida {
  partidaId: number;
  golsA: number;
  golsB: number;
}

export interface CenarioPodio {
  campeao: number | null;
  vice: number | null;
  terceiro: number | null;
}

export interface GrupoSim {
  primeiro: number | null;
  segundo: number | null;
  /** 3º colocado que avança (máximo de 8 no total, validado na UI). */
  terceiro: number | null;
}

export interface Cenario {
  partida: CenarioPartida | null;
  podio: CenarioPodio;
  artilheiroJogadorId: number | null;
  /** Classificação simulada por letra de grupo. Só conta quando completa. */
  grupos: Record<string, GrupoSim> | null;
}

export const CENARIO_VAZIO: Cenario = {
  partida: null,
  podio: { campeao: null, vice: null, terceiro: null },
  artilheiroJogadorId: null,
  grupos: null,
};

// ─── Validações ──────────────────────────────────────────────────────────────

/**
 * Converte o pódio do cenário em linhas "oficiais" simuladas, de forma
 * incremental: cada posição preenchida já pontua (campeão 30, vice 20,
 * terceiro 10, seleção no pódio em posição errada 5).
 */
export function linhasPodioSim(p: CenarioPodio): PodioOficial[] {
  const rows: PodioOficial[] = [];
  const usados = new Set<number>();
  const slots: [1 | 2 | 3, number | null][] = [
    [1, p.campeao],
    [2, p.vice],
    [3, p.terceiro],
  ];
  for (const [posicao, paisId] of slots) {
    if (paisId !== null && !usados.has(paisId)) {
      rows.push({ id: -posicao, posicao, pais_id: paisId });
      usados.add(paisId);
    }
  }
  return rows;
}

/**
 * Converte o cenário de grupos em linhas "oficiais" simuladas, de forma
 * incremental: cada 1º e 2º selecionado conta na hora; selecionar um 3º
 * significa que ele é um dos (até 8) terceiros que avançam.
 */
export function linhasGruposSim(
  grupos: Record<string, GrupoSim> | null,
): PosicaoOficialGrupo[] {
  if (!grupos) return [];
  const rows: PosicaoOficialGrupo[] = [];
  let id = -1;
  for (const g of Object.values(grupos)) {
    if (g.primeiro !== null) {
      rows.push({
        id: id--,
        pais_id: g.primeiro,
        posicao: 1,
        terceiro_avancou: false,
      });
    }
    if (g.segundo !== null && g.segundo !== g.primeiro) {
      rows.push({
        id: id--,
        pais_id: g.segundo,
        posicao: 2,
        terceiro_avancou: false,
      });
    }
    if (
      g.terceiro !== null &&
      g.terceiro !== g.primeiro &&
      g.terceiro !== g.segundo
    ) {
      rows.push({
        id: id--,
        pais_id: g.terceiro,
        posicao: 3,
        terceiro_avancou: true,
      });
    }
  }
  return rows;
}

export function contarTerceirosSim(
  grupos: Record<string, GrupoSim> | null,
): number {
  if (!grupos) return 0;
  return Object.values(grupos).filter((g) => g.terceiro !== null).length;
}

// ─── Motor ───────────────────────────────────────────────────────────────────

function apostasSinteticas(
  data: SimuladorData,
  cenario: Cenario | null,
): Aposta[] {
  const rows: Partial<Aposta>[] = data.palpitesBase.map((p) => ({
    user_id: p.user_id,
    pontos_total: p.pontos,
  }));

  if (cenario?.partida) {
    const partida = data.partidasSimulaveis.find(
      (p) => p.id === cenario.partida!.partidaId,
    );
    if (partida) {
      for (const a of partida.apostas) {
        const { pontos_total } = calcularPontosPartida(
          { gols_time_a: a.gols_time_a, gols_time_b: a.gols_time_b },
          { gols_a: cenario.partida.golsA, gols_b: cenario.partida.golsB },
        );
        if (pontos_total > 0) {
          rows.push({ user_id: a.user_id, pontos_total });
        }
      }
    }
  }

  return rows as Aposta[];
}

function podioOficialSimulado(
  data: SimuladorData,
  cenario: Cenario | null,
): PodioOficial[] {
  const rows = cenario ? linhasPodioSim(cenario.podio) : [];
  return rows.length > 0 ? rows : data.podioOficial;
}

function gruposOficialSimulado(
  data: SimuladorData,
  cenario: Cenario | null,
): PosicaoOficialGrupo[] {
  if (data.gruposEncerrados) return data.posicaoOficialGrupo;
  const rows = linhasGruposSim(cenario?.grupos ?? null);
  return rows.length > 0 ? rows : data.posicaoOficialGrupo;
}

export interface SimulacaoResultado {
  baseline: RankingEntry[];
  simulado: RankingEntry[];
  /** user_id -> posição no ranking atual (baseline). */
  posicaoBase: Map<string, number>;
}

/**
 * Calcula o ranking atual (baseline) e o ranking sob o cenário simulado.
 * Roda 100% no cliente — todas as funções de pontuação são puras.
 */
export function simularRanking(
  data: SimuladorData,
  cenario: Cenario,
): SimulacaoResultado {
  const artilheiroApostas = data.apostasArtilheiro ?? [];
  const podioApostas = data.apostasPodio ?? [];
  const grupoApostas = data.previsoesGrupo ?? [];

  const baseline = calcularRanking(
    data.perfis,
    apostasSinteticas(data, null),
    artilheiroApostas,
    data.artilheiroOficialIds,
    podioApostas,
    data.podioOficial,
    grupoApostas,
    data.posicaoOficialGrupo,
  );

  const simulado = calcularRanking(
    data.perfis,
    apostasSinteticas(data, cenario),
    artilheiroApostas,
    cenario.artilheiroJogadorId != null
      ? [cenario.artilheiroJogadorId]
      : data.artilheiroOficialIds,
    podioApostas,
    podioOficialSimulado(data, cenario),
    grupoApostas,
    gruposOficialSimulado(data, cenario),
  );

  const posicaoBase = new Map(baseline.map((e) => [e.user_id, e.posicao]));
  return { baseline, simulado, posicaoBase };
}
