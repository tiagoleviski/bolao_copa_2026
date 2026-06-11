import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { PRAZO_PREVISOES } from "@/lib/constants";
import type {
  PartidaSimulavel,
  SimuladorData,
} from "@/lib/simulacao";
import type {
  ApostaPodio,
  PodioOficial,
  PosicaoOficialGrupo,
  PrevisaoGrupo,
} from "@/lib/types";

type Time = { id: number; nome: string; bandeira_url: string };

interface PartidaRow {
  id: number;
  fase: string;
  status: string;
  data_hora: string;
  gols_a: number | null;
  gols_b: number | null;
  time_a: Time | Time[] | null;
  time_b: Time | Time[] | null;
}

const rel = <T,>(x: T | T[] | null): T | null =>
  Array.isArray(x) ? (x[0] ?? null) : x;

// Usa o admin client (service role): pódio/grupos/artilheiro têm RLS owner-only
// e apostas precisam de paginação. A visibilidade é controlada aqui:
//  - palpites de jogos: só de partidas já iniciadas (mesma regra da Auditoria);
//  - pódio/grupos/artilheiro: só após PRAZO_PREVISOES.
export async function getSimuladorData(): Promise<SimuladorData> {
  const supabase = createAdminClient();
  const prazoPrevisoesEncerrado = new Date() >= PRAZO_PREVISOES;
  const agora = new Date();

  const [
    perfis,
    partidasRaw,
    apostas,
    paisesRaw,
    jogadoresRaw,
    podioOficial,
    posicaoOficialGrupo,
    { data: artilheiroOficial },
  ] = await Promise.all([
    fetchAllRows<{ id: string; nome_completo: string; email: string }>(
      (f, t) =>
        supabase
          .from("perfis")
          .select("id, nome_completo, email")
          .neq("nome_completo", "")
          .range(f, t),
    ),
    fetchAllRows<PartidaRow>((f, t) =>
      supabase
        .from("partidas")
        .select(
          "id, fase, status, data_hora, gols_a, gols_b, time_a:time_a_id(id, nome, bandeira_url), time_b:time_b_id(id, nome, bandeira_url)",
        )
        .order("data_hora")
        .range(f, t),
    ),
    fetchAllRows<{
      user_id: string;
      partida_id: number;
      gols_time_a: number;
      gols_time_b: number;
      pontos_total: number | null;
    }>((f, t) =>
      supabase
        .from("apostas")
        .select("user_id, partida_id, gols_time_a, gols_time_b, pontos_total")
        .range(f, t),
    ),
    fetchAllRows<{ id: number; nome: string; grupo: string; bandeira_url: string }>(
      (f, t) =>
        supabase
          .from("paises")
          .select("id, nome, grupo, bandeira_url")
          .order("nome")
          .range(f, t),
    ),
    fetchAllRows<{
      id: number;
      nome: string;
      pais: Time | Time[] | null;
    }>((f, t) =>
      supabase
        .from("jogadores")
        .select("id, nome, pais:pais_id(id, nome, bandeira_url)")
        .order("nome")
        .range(f, t),
    ),
    fetchAllRows<PodioOficial>((f, t) =>
      supabase.from("podio_oficial").select("*").range(f, t),
    ),
    fetchAllRows<PosicaoOficialGrupo>((f, t) =>
      supabase.from("posicao_oficial_grupo").select("*").range(f, t),
    ),
    supabase
      .from("artilheiro_oficial")
      .select("jogador_id")
      .order("definido_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // Pódio/grupos/artilheiro: apostas só ficam visíveis após o prazo
  let apostasPodio: ApostaPodio[] | null = null;
  let previsoesGrupo: PrevisaoGrupo[] | null = null;
  let apostasArtilheiro: SimuladorData["apostasArtilheiro"] = null;
  if (prazoPrevisoesEncerrado) {
    [apostasPodio, previsoesGrupo, apostasArtilheiro] = await Promise.all([
      fetchAllRows<ApostaPodio>((f, t) =>
        supabase
          .from("aposta_podio")
          .select("id, user_id, posicao, pais_id")
          .range(f, t),
      ),
      fetchAllRows<PrevisaoGrupo>((f, t) =>
        supabase
          .from("previsao_grupo")
          .select("id, user_id, pais_id, posicao, terceiro_avanca")
          .range(f, t),
      ),
      fetchAllRows<{ id: number; user_id: string; jogador_id: number }>(
        (f, t) =>
          supabase
            .from("apostas_artilheiro")
            .select("id, user_id, jogador_id")
            .range(f, t),
      ),
    ]);
  }

  const partidas = partidasRaw.map((p) => ({
    ...p,
    time_a: rel(p.time_a),
    time_b: rel(p.time_b),
  }));

  // Soma de pontos por usuário no estado atual
  const palpitesPorUser = new Map<string, number>();
  for (const a of apostas) {
    palpitesPorUser.set(
      a.user_id,
      (palpitesPorUser.get(a.user_id) ?? 0) + (a.pontos_total ?? 0),
    );
  }

  // Partidas simuláveis: já iniciadas, não finalizadas, com os dois times definidos.
  // Só os palpites dessas partidas (já públicas) saem do servidor.
  const simulaveisIds = new Set(
    partidas
      .filter(
        (p) =>
          p.status !== "finalizado" &&
          new Date(p.data_hora) <= agora &&
          p.time_a !== null &&
          p.time_b !== null,
      )
      .map((p) => p.id),
  );

  const apostasPorPartida = new Map<
    number,
    PartidaSimulavel["apostas"]
  >();
  for (const a of apostas) {
    if (!simulaveisIds.has(a.partida_id)) continue;
    if (!apostasPorPartida.has(a.partida_id))
      apostasPorPartida.set(a.partida_id, []);
    apostasPorPartida.get(a.partida_id)!.push({
      user_id: a.user_id,
      gols_time_a: a.gols_time_a,
      gols_time_b: a.gols_time_b,
    });
  }

  const partidasSimulaveis: PartidaSimulavel[] = partidas
    .filter((p) => simulaveisIds.has(p.id))
    .map((p) => ({
      id: p.id,
      fase: p.fase,
      status: p.status,
      data_hora: p.data_hora,
      gols_a: p.gols_a,
      gols_b: p.gols_b,
      time_a: p.time_a!,
      time_b: p.time_b!,
      apostas: apostasPorPartida.get(p.id) ?? [],
    }));

  const partidasGrupos = partidas.filter((p) => p.fase === "Grupos");
  const gruposEncerrados =
    partidasGrupos.length > 0 &&
    partidasGrupos.every((p) => p.status === "finalizado");

  // ── Seleções eliminadas (não podem mais terminar no top 3) ────────────────
  const eliminados = new Set<number>();
  // Fase de grupos encerrada: 4º, ou 3º que não avançou
  for (const row of posicaoOficialGrupo) {
    if (row.posicao === 4 || (row.posicao === 3 && !row.terceiro_avancou)) {
      eliminados.add(row.pais_id);
    }
  }
  // Mata-mata: perdedor é eliminado, EXCETO na Semifinal (ainda disputa o 3º
  // lugar) e na Final (perdedor é vice — segue no pódio).
  const fasesSemEliminacao = new Set(["Grupos", "Semifinal", "Final"]);
  for (const p of partidas) {
    if (fasesSemEliminacao.has(p.fase)) continue;
    if (p.status !== "finalizado") continue;
    if (p.gols_a === null || p.gols_b === null || p.gols_a === p.gols_b)
      continue; // empate no mata-mata (pênaltis) não é decidível pelo placar
    const perdedor = p.gols_a > p.gols_b ? p.time_b : p.time_a;
    if (perdedor) eliminados.add(perdedor.id);
  }

  return {
    perfis,
    palpitesBase: [...palpitesPorUser.entries()].map(([user_id, pontos]) => ({
      user_id,
      pontos,
    })),
    partidasSimulaveis,
    prazoPrevisoesEncerrado,
    gruposEncerrados,
    apostasPodio,
    previsoesGrupo,
    apostasArtilheiro,
    artilheiroOficialId: artilheiroOficial?.jogador_id ?? null,
    podioOficial,
    posicaoOficialGrupo,
    paises: paisesRaw.map((p) => ({
      ...p,
      eliminado: eliminados.has(p.id),
    })),
    jogadores: jogadoresRaw
      .map((j) => ({ id: j.id, nome: j.nome, pais: rel(j.pais)! }))
      .filter((j) => j.pais),
  };
}
