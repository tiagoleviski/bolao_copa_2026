"use server";

import { createClient } from "@/lib/supabase/server";
import { apostaAberta } from "@/lib/time";

export async function salvarAposta(
  partidaId: number,
  golsTimeA: number,
  golsTimeB: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: partida } = await supabase
    .from("partidas")
    .select("data_hora")
    .eq("id", partidaId)
    .single();

  if (!partida) return { error: "Partida não encontrada." };
  if (!apostaAberta(partida.data_hora))
    return { error: "Prazo para apostas encerrado." };

  const { error } = await supabase.from("apostas").upsert(
    {
      user_id: user.id,
      partida_id: partidaId,
      gols_time_a: golsTimeA,
      gols_time_b: golsTimeB,
    },
    { onConflict: "user_id,partida_id" },
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function atualizarResultado(
  partidaId: number,
  golsA: number,
  golsB: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: perfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.role !== "admin") return { error: "Acesso negado." };

  const { error } = await supabase
    .from("partidas")
    .update({ gols_a: golsA, gols_b: golsB, status: "finalizado" })
    .eq("id", partidaId);

  if (error) return { error: error.message };

  const { data: apostas } = await supabase
    .from("apostas")
    .select("id, gols_time_a, gols_time_b")
    .eq("partida_id", partidaId);

  if (apostas && apostas.length > 0) {
    const { calcularPontosPartida } = await import("@/lib/scoring");
    for (const aposta of apostas) {
      const pontos = calcularPontosPartida(
        { gols_time_a: aposta.gols_time_a, gols_time_b: aposta.gols_time_b },
        { gols_a: golsA, gols_b: golsB },
      );
      await supabase.from("apostas").update(pontos).eq("id", aposta.id);
    }
  }

  return { success: true };
}
