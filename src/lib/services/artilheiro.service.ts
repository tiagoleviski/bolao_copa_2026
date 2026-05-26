import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PRAZO_PREVISOES } from "@/lib/constants";

export async function getJogadores() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jogadores")
    .select("id, nome, pais:paises(id, nome, bandeira_url)")
    .order("nome");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getApostaArtilheiro(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("apostas_artilheiro")
    .select("jogador_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function salvarApostaArtilheiro(
  userId: string,
  jogadorId: number,
) {
  if (new Date() > PRAZO_PREVISOES)
    throw new Error("Prazo para apostas encerrado.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("apostas_artilheiro")
    .upsert(
      { user_id: userId, jogador_id: jogadorId },
      { onConflict: "user_id" },
    );
  if (error) throw new Error(error.message);
}
