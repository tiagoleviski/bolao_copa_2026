import "server-only";

import { createClient } from "@/lib/supabase/server";
import { apostaAberta } from "@/lib/time";

export async function getApostasDoUsuario(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apostas")
    .select("*")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTodasApostas() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("apostas").select("*");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function salvarAposta(
  userId: string,
  partidaId: number,
  golsTimeA: number,
  golsTimeB: number,
) {
  const supabase = await createClient();

  const { data: partida } = await supabase
    .from("partidas")
    .select("data_hora")
    .eq("id", partidaId)
    .single();

  if (!partida) throw new Error("Partida não encontrada.");
  if (!apostaAberta(partida.data_hora))
    throw new Error("Prazo para apostas encerrado.");

  const { error } = await supabase.from("apostas").upsert(
    {
      user_id: userId,
      partida_id: partidaId,
      gols_time_a: golsTimeA,
      gols_time_b: golsTimeB,
    },
    { onConflict: "user_id,partida_id" },
  );
  if (error) throw new Error(error.message);
}
