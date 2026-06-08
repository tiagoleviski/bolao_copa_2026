import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import type {
  ApostaPodio,
  PodioOficial,
  PosicaoOficialGrupo,
  PrevisaoGrupo,
} from "@/lib/types";

// Usa o admin client (service role) porque pódio/grupos/artilheiro têm RLS
// owner-only — com o client de usuário o ranking só veria as apostas de quem
// está olhando. A rota calcula o ranking no servidor e devolve apenas os
// pontos (calcularRanking), nunca os palpites crus, então não há vazamento.
export async function getRankingData() {
  const supabase = createAdminClient();

  const [
    perfis,
    apostas,
    apostasArtilheiro,
    { data: artilheiroOficial },
    partidas,
    apostasPodio,
    podioOficial,
    previsoesGrupo,
    posicaoOficialGrupo,
  ] = await Promise.all([
    fetchAllRows((f, t) =>
      supabase
        .from("perfis")
        .select("id, nome_completo, email")
        .neq("nome_completo", "")
        .range(f, t),
    ),
    fetchAllRows((f, t) => supabase.from("apostas").select("*").range(f, t)),
    fetchAllRows((f, t) =>
      supabase.from("apostas_artilheiro").select("*").range(f, t),
    ),
    supabase
      .from("artilheiro_oficial")
      .select("jogador_id")
      .order("definido_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
    fetchAllRows((f, t) =>
      supabase
        .from("partidas")
        .select("id, gols_a, gols_b, status")
        .eq("status", "finalizado")
        .range(f, t),
    ),
    fetchAllRows((f, t) =>
      supabase.from("aposta_podio").select("*").range(f, t),
    ),
    fetchAllRows((f, t) =>
      supabase.from("podio_oficial").select("*").range(f, t),
    ),
    fetchAllRows((f, t) =>
      supabase.from("previsao_grupo").select("*").range(f, t),
    ),
    fetchAllRows((f, t) =>
      supabase.from("posicao_oficial_grupo").select("*").range(f, t),
    ),
  ]);

  return {
    perfis,
    apostas,
    apostasArtilheiro,
    artilheiroOficialId: artilheiroOficial?.jogador_id ?? null,
    totalPartidasFinalizadas: partidas.length,
    apostasPodio: apostasPodio as ApostaPodio[],
    podioOficial: podioOficial as PodioOficial[],
    previsoesGrupo: previsoesGrupo as PrevisaoGrupo[],
    posicaoOficialGrupo: posicaoOficialGrupo as PosicaoOficialGrupo[],
  };
}
