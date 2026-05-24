import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { FaseClassificacao } from "@/lib/types";

export async function getRankingData() {
  const supabase = await createClient();

  const [
    { data: perfis },
    { data: apostas },
    { data: previsoes },
    { data: apostasArtilheiro },
    { data: artilheiroOficial },
    { data: partidas },
    classificacaoRes,
  ] = await Promise.all([
    supabase.from("perfis").select("id, nome_completo, email"),
    supabase.from("apostas").select("*"),
    supabase.from("previsoes_classificacao").select("*"),
    supabase.from("apostas_artilheiro").select("*"),
    supabase
      .from("artilheiro_oficial")
      .select("jogador_id")
      .order("definido_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("partidas")
      .select("id, gols_a, gols_b, status")
      .eq("status", "finalizado"),
    supabase
      .from("classificacao_oficial")
      .select("pais_id, fase")
      .then(
        (res) => res,
        () => ({ data: null, error: null }),
      ),
  ]);

  const classificacaoOficial = new Map<number, FaseClassificacao[]>();
  if (classificacaoRes.data) {
    for (const row of classificacaoRes.data) {
      const fases = classificacaoOficial.get(row.pais_id) ?? [];
      fases.push(row.fase as FaseClassificacao);
      classificacaoOficial.set(row.pais_id, fases);
    }
  }

  return {
    perfis: perfis ?? [],
    apostas: apostas ?? [],
    previsoes: previsoes ?? [],
    apostasArtilheiro: apostasArtilheiro ?? [],
    artilheiroOficialId: artilheiroOficial?.jogador_id ?? null,
    classificacaoOficial,
    totalPartidasFinalizadas: (partidas ?? []).length,
  };
}
