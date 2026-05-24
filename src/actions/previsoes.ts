"use server";

import { createClient } from "@/lib/supabase/server";
import { FASES_ORDEM, PRAZO_PREVISOES } from "@/lib/constants";
import type { FaseClassificacao } from "@/lib/types";

export async function salvarPrevisaoFase(
  fase: FaseClassificacao,
  paisIds: number[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };
  if (new Date() > PRAZO_PREVISOES) return { error: "Prazo encerrado." };

  // Get teams currently predicted for this phase
  const { data: atual } = await supabase
    .from("previsoes_classificacao")
    .select("pais_id")
    .eq("user_id", user.id)
    .eq("fase", fase);

  const idsAtuais = new Set((atual ?? []).map((r) => r.pais_id));
  const idsNovos = new Set(paisIds);

  const adicionados = paisIds.filter((id) => !idsAtuais.has(id));
  const removidos = [...idsAtuais].filter((id) => !idsNovos.has(id));

  // Insert new predictions
  if (adicionados.length > 0) {
    const { error } = await supabase
      .from("previsoes_classificacao")
      .insert(
        adicionados.map((pais_id) => ({ user_id: user.id, pais_id, fase })),
      );
    if (error) return { error: error.message };
  }

  // Remove dropped predictions and cascade to later phases
  if (removidos.length > 0) {
    const faseIdx = FASES_ORDEM.indexOf(fase);
    const fasesPosteriores = FASES_ORDEM.slice(faseIdx);

    const { error } = await supabase
      .from("previsoes_classificacao")
      .delete()
      .eq("user_id", user.id)
      .in("fase", fasesPosteriores)
      .in("pais_id", removidos);

    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function salvarPosicaoEspecifica(
  fase: FaseClassificacao,
  paisId: number | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };
  if (new Date() > PRAZO_PREVISOES) return { error: "Prazo encerrado." };

  // Delete existing prediction for this specific position
  await supabase
    .from("previsoes_classificacao")
    .delete()
    .eq("user_id", user.id)
    .eq("fase", fase);

  if (paisId !== null) {
    const { error } = await supabase.from("previsoes_classificacao").insert({
      user_id: user.id,
      pais_id: paisId,
      fase,
    });
    if (error) return { error: error.message };
  }

  return { success: true };
}
