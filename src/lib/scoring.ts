import { PONTUACAO } from "./constants";
import type {
  Aposta,
  ApostaArtilheiro,
  FaseClassificacao,
  Partida,
  Perfil,
  PrevisaoClassificacao,
  RankingEntry,
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

export function calcularPontosPrevisoes(
  previsoes: PrevisaoClassificacao[],
  classificacaoOficial: Map<number, FaseClassificacao[]>,
): number {
  let total = 0;
  for (const previsao of previsoes) {
    const fasesAlcancadas = classificacaoOficial.get(previsao.pais_id) ?? [];
    if (fasesAlcancadas.includes(previsao.fase as FaseClassificacao)) {
      total += PONTUACAO.CLASSIFICACAO[previsao.fase as FaseClassificacao] ?? 0;
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
  previsoes: PrevisaoClassificacao[],
  classificacaoOficial: Map<number, FaseClassificacao[]>,
  apostasArtilheiro: ApostaArtilheiro[],
  artilheiroOficialId: number | null,
): RankingEntry[] {
  const apostasMap = new Map<string, Aposta[]>();
  for (const aposta of apostas) {
    const list = apostasMap.get(aposta.user_id) ?? [];
    list.push(aposta);
    apostasMap.set(aposta.user_id, list);
  }

  const previsoesMap = new Map<string, PrevisaoClassificacao[]>();
  for (const prev of previsoes) {
    const list = previsoesMap.get(prev.user_id) ?? [];
    list.push(prev);
    previsoesMap.set(prev.user_id, list);
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

    const minhasPrevisoes = previsoesMap.get(perfil.id) ?? [];
    const pontos_previsoes = calcularPontosPrevisoes(
      minhasPrevisoes,
      classificacaoOficial,
    );

    const minhaApostaArtilheiro = artilheiroMap.get(perfil.id) ?? null;
    const pontos_artilheiro = calcularPontosArtilheiro(
      minhaApostaArtilheiro,
      artilheiroOficialId,
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
