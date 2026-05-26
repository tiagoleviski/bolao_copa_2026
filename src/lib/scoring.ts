import { PONTUACAO, PONTUACAO_CHAVEAMENTO } from "./constants";
import type {
  Aposta,
  ApostaArtilheiro,
  Partida,
  Perfil,
  PrevisaoChaveamento,
  RankingEntry,
  ResultadoChaveamentoOficial,
} from "./types";

export function calcularPontosPartida(
  aposta: Pick<Aposta, "gols_time_a" | "gols_time_b">,
  partida: Pick<Partida, "gols_a" | "gols_b">,
): { pontos_placar: number; pontos_resultado: number; pontos_total: number } {
  if (partida.gols_a === null || partida.gols_b === null) {
    return { pontos_placar: 0, pontos_resultado: 0, pontos_total: 0 };
  }

  const acertouPlacar =
    aposta.gols_time_a === partida.gols_a &&
    aposta.gols_time_b === partida.gols_b;

  if (acertouPlacar) {
    return {
      pontos_placar: PONTUACAO.PLACAR_EXATO,
      pontos_resultado: 0,
      pontos_total: PONTUACAO.PLACAR_EXATO,
    };
  }

  const resultadoReal = Math.sign(partida.gols_a - partida.gols_b);
  const resultadoAposta = Math.sign(aposta.gols_time_a - aposta.gols_time_b);
  const acertouResultado = resultadoReal === resultadoAposta;

  if (acertouResultado) {
    return {
      pontos_placar: 0,
      pontos_resultado: PONTUACAO.RESULTADO_CORRETO,
      pontos_total: PONTUACAO.RESULTADO_CORRETO,
    };
  }

  return { pontos_placar: 0, pontos_resultado: 0, pontos_total: 0 };
}

export function calcularPontosChaveamento(
  previsoes: PrevisaoChaveamento[],
  resultadosOficiais: ResultadoChaveamentoOficial[],
): number {
  if (resultadosOficiais.length === 0) return 0;

  const vencedorReal = new Map<string, number>();
  const timesPorFase = new Map<string, Set<number>>();

  for (const r of resultadosOficiais) {
    vencedorReal.set(`${r.fase}:${r.slot}`, r.pais_id);
    const set = timesPorFase.get(r.fase) ?? new Set<number>();
    set.add(r.pais_id);
    timesPorFase.set(r.fase, set);
  }

  let total = 0;
  for (const prev of previsoes) {
    const key = `${prev.fase}:${prev.slot}`;
    const vencedor = vencedorReal.get(key);

    if (vencedor === prev.pais_id) {
      total += PONTUACAO_CHAVEAMENTO.CAMINHO_EXATO;
    } else if (timesPorFase.get(prev.fase)?.has(prev.pais_id)) {
      total += PONTUACAO_CHAVEAMENTO.AVANCOU;
    }
  }
  return total;
}

export function calcularPontosArtilheiro(
  aposta: ApostaArtilheiro | null,
  artilheiroOficialId: number | null,
): number {
  if (!aposta || artilheiroOficialId === null) return 0;
  return aposta.jogador_id === artilheiroOficialId ? PONTUACAO.ARTILHEIRO : 0;
}

export function calcularRanking(
  perfis: Perfil[],
  apostas: Aposta[],
  apostasArtilheiro: ApostaArtilheiro[],
  artilheiroOficialId: number | null,
  previsoesChaveamento: PrevisaoChaveamento[] = [],
  resultadosChaveamento: ResultadoChaveamentoOficial[] = [],
): RankingEntry[] {
  const apostasMap = new Map<string, Aposta[]>();
  for (const aposta of apostas) {
    const list = apostasMap.get(aposta.user_id) ?? [];
    list.push(aposta);
    apostasMap.set(aposta.user_id, list);
  }

  const chaveamentoMap = new Map<string, PrevisaoChaveamento[]>();
  for (const prev of previsoesChaveamento) {
    const list = chaveamentoMap.get(prev.user_id) ?? [];
    list.push(prev);
    chaveamentoMap.set(prev.user_id, list);
  }

  const artilheiroMap = new Map<string, ApostaArtilheiro>();
  for (const a of apostasArtilheiro) {
    artilheiroMap.set(a.user_id, a);
  }

  const entries: RankingEntry[] = perfis.map((perfil) => {
    const minhasApostas = apostasMap.get(perfil.id) ?? [];
    const pontos_palpites = minhasApostas.reduce(
      (acc, a) => acc + (a.pontos_total ?? 0),
      0,
    );

    const minhaApostaArtilheiro = artilheiroMap.get(perfil.id) ?? null;
    const pontos_artilheiro = calcularPontosArtilheiro(
      minhaApostaArtilheiro,
      artilheiroOficialId,
    );

    const meusChaveamentos = chaveamentoMap.get(perfil.id) ?? [];
    const pontos_previsoes = calcularPontosChaveamento(
      meusChaveamentos,
      resultadosChaveamento,
    );

    return {
      user_id: perfil.id,
      nome_completo: perfil.nome_completo,
      pontos_palpites,
      pontos_previsoes,
      pontos_artilheiro,
      pontos_total: pontos_palpites + pontos_previsoes + pontos_artilheiro,
      posicao: 0,
    };
  });

  entries.sort((a, b) => b.pontos_total - a.pontos_total);
  entries.forEach((e, i) => (e.posicao = i + 1));

  return entries;
}
