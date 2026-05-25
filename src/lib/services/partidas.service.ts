import "server-only";

import { createClient } from "@/lib/supabase/server";
import { calcularPontosPartida } from "@/lib/scoring";
import {
  calcularClassificacaoGrupos,
  rankearTerceirosLugares,
} from "@/lib/services/classificacao.service";
import { PARTIDAS_POR_GRUPO } from "@/lib/constants";

export async function getPartidasComTimes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidas")
    .select(
      "*, time_a:time_a_id(id,nome,bandeira_url,grupo), time_b:time_b_id(id,nome,bandeira_url,grupo)",
    )
    .order("data_hora");
  if (error) throw new Error(error.message);
  return data;
}

export async function getPartidasFinalizadas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidas")
    .select("id, gols_a, gols_b, status")
    .eq("status", "finalizado");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function atualizarResultadoPartida(
  partidaId: number,
  golsA: number,
  golsB: number,
) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("partidas")
    .update({ gols_a: golsA, gols_b: golsB, status: "finalizado" })
    .eq("id", partidaId);
  if (updateError) throw new Error(updateError.message);

  const { data: apostas } = await supabase
    .from("apostas")
    .select("id, gols_time_a, gols_time_b")
    .eq("partida_id", partidaId);

  if (apostas && apostas.length > 0) {
    for (const aposta of apostas) {
      const pontos = calcularPontosPartida(
        { gols_time_a: aposta.gols_time_a, gols_time_b: aposta.gols_time_b },
        { gols_a: golsA, gols_b: golsB },
      );
      await supabase.from("apostas").update(pontos).eq("id", aposta.id);
    }
  }

  try {
    await popularChaveamento();
  } catch (e) {
    console.error("popularChaveamento falhou:", e);
  }
}

// Formato real no banco: "1º Lugar Grupo A", "2º Lugar Grupo B", etc.
const PLACEHOLDER_GRUPO_RE = /^(\d)º Lugar Grupo ([A-L])$/;

function resolverPlaceholder(
  placeholder: string | null,
  standings: ReturnType<typeof calcularClassificacaoGrupos>,
  terceiros: ReturnType<typeof rankearTerceirosLugares>,
  gruposFinalizados: Set<string>,
  todosGruposFinalizados: boolean,
): number | null {
  if (!placeholder) return null;

  // "1º Lugar Grupo A" → 1º colocado do grupo A
  const m = PLACEHOLDER_GRUPO_RE.exec(placeholder);
  if (m) {
    const posicao = parseInt(m[1]);
    const grupo = m[2];
    if (!gruposFinalizados.has(grupo)) return null;
    const grupoData = standings.find((g) => g.grupo === grupo);
    return grupoData?.equipes[posicao - 1]?.pais_id ?? null;
  }

  // "Melhor 3º Lugar (Grupos A/B/C/D/F)" → melhor 3º entre os grupos listados
  // Só resolve quando todos os grupos terminaram (ranking de terceiros é definitivo)
  const gruposMatch = /\(Grupos ([A-L/]+)\)/.exec(placeholder);
  if (gruposMatch) {
    if (!todosGruposFinalizados) return null;
    const grupos = gruposMatch[1].split("/");
    const time = terceiros.find((t) => grupos.includes(t.grupo));
    return time?.pais_id ?? null;
  }

  console.warn(`[chaveamento] placeholder não reconhecido: "${placeholder}"`);
  return null;
}

export async function popularChaveamento(): Promise<void> {
  const supabase = await createClient();

  const [{ data: mataMata }, { data: partidasGrupo }, { data: paises }] =
    await Promise.all([
      supabase
        .from("partidas")
        .select(
          "id, time_a_id, time_b_id, placeholder_time_a, placeholder_time_b",
        )
        .gte("rodada", 4)
        .or("time_a_id.is.null,time_b_id.is.null"),
      supabase
        .from("partidas")
        .select(
          "id, time_a_id, time_b_id, gols_a, gols_b, grupo, status, rodada",
        )
        .lte("rodada", 3),
      supabase.from("paises").select("id, nome, grupo, bandeira_url"),
    ]);

  if (!mataMata?.length || !partidasGrupo || !paises) return;

  // Quais grupos têm todas as partidas finalizadas?
  const contagemPorGrupo = new Map<
    string,
    { total: number; finalizadas: number }
  >();
  for (const p of partidasGrupo) {
    if (!p.grupo) continue;
    const entry = contagemPorGrupo.get(p.grupo) ?? { total: 0, finalizadas: 0 };
    entry.total++;
    if (p.status === "finalizado") entry.finalizadas++;
    contagemPorGrupo.set(p.grupo, entry);
  }

  const gruposFinalizados = new Set(
    [...contagemPorGrupo.entries()]
      .filter(([, v]) => v.finalizadas >= PARTIDAS_POR_GRUPO)
      .map(([k]) => k),
  );

  const todosGruposFinalizados = gruposFinalizados.size === 12;

  const standings = calcularClassificacaoGrupos(partidasGrupo, paises);
  const terceiros = rankearTerceirosLugares(standings);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: PromiseLike<any>[] = [];

  for (const partida of mataMata) {
    const novoA =
      partida.time_a_id == null
        ? resolverPlaceholder(
            partida.placeholder_time_a,
            standings,
            terceiros,
            gruposFinalizados,
            todosGruposFinalizados,
          )
        : null;
    const novoB =
      partida.time_b_id == null
        ? resolverPlaceholder(
            partida.placeholder_time_b,
            standings,
            terceiros,
            gruposFinalizados,
            todosGruposFinalizados,
          )
        : null;

    if (novoA !== null || novoB !== null) {
      const patch: Record<string, number> = {};
      if (novoA !== null) patch.time_a_id = novoA;
      if (novoB !== null) patch.time_b_id = novoB;
      updates.push(
        supabase.from("partidas").update(patch).eq("id", partida.id),
      );
    }
  }

  await Promise.all(updates);
}
