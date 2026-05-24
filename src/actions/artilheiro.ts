"use server";

import { createClient } from "@/lib/supabase/server";
import { PRAZO_PREVISOES } from "@/lib/constants";

export async function salvarApostaArtilheiro(jogadorId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  if (new Date() > PRAZO_PREVISOES) {
    return { error: "Prazo para apostas encerrado." };
  }

  const { error } = await supabase
    .from("apostas_artilheiro")
    .upsert(
      { user_id: user.id, jogador_id: jogadorId },
      { onConflict: "user_id" },
    );

  if (error) return { error: error.message };
  return { success: true };
}
