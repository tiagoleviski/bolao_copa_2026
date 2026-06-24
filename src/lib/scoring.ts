import { PONTUACAO, PONTUACAO_GRUPO, PONTUACAO_PODIO } from "./constants";
import type {
  Aposta,
  ApostaArtilheiro,
  ApostaPodio,
  Partida,
  Perfil,
  PodioOficial,
  PosicaoOficialGrupo,
  PrevisaoGrupo,
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

export function calcularPontosPodio(
  aposta: ApostaPodio[],
  podioOficial: PodioOficial[],
): number {
  if (podioOficial.length === 0 || aposta.length === 0) return 0;

  const podioMap = new Map(podioOficial.map((p) => [p.posicao, p.pais_id]));
  const podioSet = new Set(podioOficial.map((p) => p.pais_id));

  const todoExato =
    aposta.length === 3 &&
    aposta.every((a) => podioMap.get(a.posicao) === a.pais_id);
  if (todoExato) return PONTUACAO_PODIO.PODIO_EXATO;

  let pontos = 0;

  for (const a of aposta) {
    if (podioMap.get(a.posicao) === a.pais_id) {
      if (a.posicao === 1) pontos += PONTUACAO_PODIO.CAMPEAO_EXATO;
      else if (a.posicao === 2) pontos += PONTUACAO_PODIO.VICE_EXATO;
      else if (a.posicao === 3) pontos += PONTUACAO_PODIO.TERCEIRO_EXATO;
    } else if (podioSet.has(a.pais_id)) {
      pontos += PONTUACAO_PODIO.TIME_NO_PODIO;
    }
  }

  return Math.min(pontos, PONTUACAO_PODIO.PODIO_EXATO);
}

export function calcularPontosArtilheiro(
  aposta: ApostaArtilheiro | null,
  artilheiroOficialId: number | null,
): number {
  if (!aposta || artilheiroOficialId === null) return 0;
  return aposta.jogador_id === artilheiroOficialId ? PONTUACAO.ARTILHEIRO : 0;
}

function avancou(posicao: number, terceiroAvanca: boolean): boolean {
  return posicao <= 2 || (posicao === 3 && terceiroAvanca);
}

export function calcularPontosGrupo(
  previsoes: PrevisaoGrupo[],
  oficiais: PosicaoOficialGrupo[],
): number {
  if (oficiais.length === 0 || previsoes.length === 0) return 0;

  const oficialMap = new Map(oficiais.map((o) => [o.pais_id, o]));
  let pontos = 0;

  for (const prev of previsoes) {
    const oficial = oficialMap.get(prev.pais_id);
    if (!oficial) continue;

    // Para o 3º lugar, exige que o status de avanço também coincida —
    // prever 3º avançando quando o time não avançou não vale posição exata.
    const posicaoExata =
      prev.posicao === oficial.posicao &&
      (prev.posicao !== 3 || prev.terceiro_avanca === oficial.terceiro_avancou);

    if (posicaoExata) {
      pontos += PONTUACAO_GRUPO.POSICAO_EXATA;
    } else if (
      avancou(prev.posicao, prev.terceiro_avanca) &&
      avancou(oficial.posicao, oficial.terceiro_avancou)
    ) {
      pontos += PONTUACAO_GRUPO.TIME_PASSOU;
    }
  }

  return pontos;
}

export function calcularRanking(
  perfis: Perfil[],
  apostas: Aposta[],
  apostasArtilheiro: ApostaArtilheiro[],
  artilheiroOficialId: number | null,
  apostasPodio: ApostaPodio[] = [],
  podioOficial: PodioOficial[] = [],
  previsoesGrupo: PrevisaoGrupo[] = [],
  posicaoOficialGrupo: PosicaoOficialGrupo[] = [],
  snapshotMap: Map<string, number> = new Map(),
): RankingEntry[] {
  const apostasMap = new Map<string, Aposta[]>();
  for (const aposta of apostas) {
    const list = apostasMap.get(aposta.user_id) ?? [];
    list.push(aposta);
    apostasMap.set(aposta.user_id, list);
  }

  const artilheiroMap = new Map<string, ApostaArtilheiro>();
  for (const a of apostasArtilheiro) {
    artilheiroMap.set(a.user_id, a);
  }

  const podioMap = new Map<string, ApostaPodio[]>();
  for (const a of apostasPodio) {
    const list = podioMap.get(a.user_id) ?? [];
    list.push(a);
    podioMap.set(a.user_id, list);
  }

  const grupoMap = new Map<string, PrevisaoGrupo[]>();
  for (const p of previsoesGrupo) {
    const list = grupoMap.get(p.user_id) ?? [];
    list.push(p);
    grupoMap.set(p.user_id, list);
  }

  const entries: RankingEntry[] = perfis.map((perfil) => {
    const minhasApostas = apostasMap.get(perfil.id) ?? [];
    const pontos_palpites = minhasApostas.reduce(
      (acc, a) => acc + (a.pontos_total ?? 0),
      0,
    );
    const cravadas = minhasApostas.filter(
      (a) => (a.pontos_placar ?? 0) > 0,
    ).length;

    const minhaApostaArtilheiro = artilheiroMap.get(perfil.id) ?? null;
    const pontos_artilheiro = calcularPontosArtilheiro(
      minhaApostaArtilheiro,
      artilheiroOficialId,
    );

    const meuPodio = podioMap.get(perfil.id) ?? [];
    const pontos_podio = calcularPontosPodio(meuPodio, podioOficial);

    const minhasPrevisoes = grupoMap.get(perfil.id) ?? [];
    const pontos_grupo = calcularPontosGrupo(
      minhasPrevisoes,
      posicaoOficialGrupo,
    );

    return {
      user_id: perfil.id,
      nome_completo: perfil.nome_completo,
      pontos_palpites,
      pontos_artilheiro,
      pontos_podio,
      pontos_grupo,
      cravadas,
      pontos_total:
        pontos_palpites + pontos_artilheiro + pontos_podio + pontos_grupo,
      posicao: 0,
      posicao_anterior: snapshotMap.get(perfil.id) ?? null,
    };
  });

  entries.sort(
    (a, b) => b.pontos_total - a.pontos_total || b.cravadas - a.cravadas,
  );
  entries.forEach((e, i) => (e.posicao = i + 1));

  return entries;
}
