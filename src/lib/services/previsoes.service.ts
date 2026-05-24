import "server-only";

import { createClient } from "@/lib/supabase/server";
import { FASES_ORDEM, PRAZO_PREVISOES } from "@/lib/constants";
import type { FaseClassificacao } from "@/lib/types";

export async function getPrevisoes(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("previsoes_classificacao")
    .select("*")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTodasPrevisoes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("previsoes_classificacao")
    .select("*");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function salvarPrevisaoFase(
  userId: string,
  fase: FaseClassificacao,
  paisIds: number[],
) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();

  const { data: atual } = await supabase
    .from("previsoes_classificacao")
    .select("pais_id")
    .eq("user_id", userId)
    .eq("fase", fase);

  const idsAtuais = new Set((atual ?? []).map((r) => r.pais_id));
  const idsNovos = new Set(paisIds);

  const adicionados = paisIds.filter((id) => !idsAtuais.has(id));
  const removidos = [...idsAtuais].filter((id) => !idsNovos.has(id));

  if (adicionados.length > 0) {
    const { error } = await supabase
      .from("previsoes_classificacao")
      .insert(
        adicionados.map((pais_id) => ({ user_id: userId, pais_id, fase })),
      );
    if (error) throw new Error(error.message);
  }

  if (removidos.length > 0) {
    const faseIdx = FASES_ORDEM.indexOf(fase);
    const fasesPosteriores = FASES_ORDEM.slice(faseIdx);
    const { error } = await supabase
      .from("previsoes_classificacao")
      .delete()
      .eq("user_id", userId)
      .in("fase", fasesPosteriores)
      .in("pais_id", removidos);
    if (error) throw new Error(error.message);
  }
}

export async function salvarPosicaoEspecifica(
  userId: string,
  fase: FaseClassificacao,
  paisId: number | null,
) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();

  await supabase
    .from("previsoes_classificacao")
    .delete()
    .eq("user_id", userId)
    .eq("fase", fase);

  if (paisId !== null) {
    const { error } = await supabase
      .from("previsoes_classificacao")
      .insert({ user_id: userId, pais_id: paisId, fase });
    if (error) throw new Error(error.message);
  }
}
