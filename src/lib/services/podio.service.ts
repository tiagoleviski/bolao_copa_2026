import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PRAZO_PREVISOES } from "@/lib/constants";
import type { ApostaPodio, PodioOficial } from "@/lib/types";

export async function getPodioData(userId: string) {
  const supabase = await createClient();

  const [paisesRes, apostaPodioRes, podioOficialRes] = await Promise.all([
    supabase.from("paises").select("*").order("grupo").order("nome"),
    supabase.from("aposta_podio").select("*").eq("user_id", userId),
    supabase.from("podio_oficial").select("*"),
  ]);

  if (paisesRes.error) throw new Error(paisesRes.error.message);

  return {
    paises: paisesRes.data ?? [],
    apostaPodio: (apostaPodioRes.data ?? []) as ApostaPodio[],
    podioOficial: (podioOficialRes.data ?? []) as PodioOficial[],
  };
}

export async function salvarApostaPodio(
  userId: string,
  previsoes: Array<{ posicao: 1 | 2 | 3; pais_id: number }>,
) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();

  const { error: delError } = await supabase
    .from("aposta_podio")
    .delete()
    .eq("user_id", userId);
  if (delError) throw new Error(delError.message);

  if (previsoes.length === 0) return;

  const { error } = await supabase.from("aposta_podio").insert(
    previsoes.map((p) => ({
      user_id: userId,
      posicao: p.posicao,
      pais_id: p.pais_id,
    })),
  );
  if (error) throw new Error(error.message);
}
