import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { calcularPontosPartida } from "@/lib/scoring";

export async function getPartidasComTimes() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partidas")
    .select(
      "*, time_a:time_a_id(id,nome,bandeira_url,grupo), time_b:time_b_id(id,nome,bandeira_url,grupo)",
    )
    .order("data_hora");
  if (error) throw new Error(error.message);
  return data;
}

export async function getPaises() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("paises")
    .select("id, nome, grupo, bandeira_url")
    .order("nome");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function atualizarTimesPartida(
  partidaId: number,
  timeAId: number | null,
  timeBId: number | null,
) {
  const supabase = createAdminClient();

  const { data: partida, error: fetchError } = await supabase
    .from("partidas")
    .select("rodada")
    .eq("id", partidaId)
    .single();
  if (fetchError) throw new Error(fetchError.message);
  if (!partida || partida.rodada < 4)
    throw new Error("Só é possível editar os times de partidas do mata-mata.");

  const { error: updateError } = await supabase
    .from("partidas")
    .update({ time_a_id: timeAId, time_b_id: timeBId })
    .eq("id", partidaId);
  if (updateError) throw new Error(updateError.message);
}

export async function getPartidasFinalizadas() {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();

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
}
