import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ApostaPodio,
  PodioOficial,
  ResultadoChaveamentoOficial,
} from "@/lib/types";

export async function getRankingData() {
  const supabase = await createClient();

  const [
    { data: perfis },
    { data: apostas },
    { data: apostasArtilheiro },
    { data: artilheiroOficial },
    { data: partidas },
    { data: previsoesChaveamento },
    { data: resultadosChaveamento },
    { data: apostasPodio },
    { data: podioOficial },
  ] = await Promise.all([
    supabase.from("perfis").select("id, nome_completo, email"),
    supabase.from("apostas").select("*"),
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
    supabase.from("previsao_chaveamento").select("*"),
    supabase
      .from("resultado_chaveamento_oficial")
      .select("*")
      .then(
        (res) => res,
        () => ({ data: null, error: null }),
      ),
    supabase
      .from("aposta_podio")
      .select("*")
      .then(
        (res) => res,
        () => ({ data: null, error: null }),
      ),
    supabase
      .from("podio_oficial")
      .select("*")
      .then(
        (res) => res,
        () => ({ data: null, error: null }),
      ),
  ]);

  return {
    perfis: perfis ?? [],
    apostas: apostas ?? [],
    apostasArtilheiro: apostasArtilheiro ?? [],
    artilheiroOficialId: artilheiroOficial?.jogador_id ?? null,
    totalPartidasFinalizadas: (partidas ?? []).length,
    previsoesChaveamento: previsoesChaveamento ?? [],
    resultadosChaveamentoOficiais: (resultadosChaveamento ??
      []) as ResultadoChaveamentoOficial[],
    apostasPodio: (apostasPodio ?? []) as ApostaPodio[],
    podioOficial: (podioOficial ?? []) as PodioOficial[],
  };
}
