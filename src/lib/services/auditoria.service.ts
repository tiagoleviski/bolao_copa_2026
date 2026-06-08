import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { apostaAberta } from "@/lib/time";
import { PRAZO_PREVISOES } from "@/lib/constants";

// Usa o admin client (service role) porque pódio/grupos/artilheiro têm RLS
// owner-only. A exibição dos palpites de pódio/grupos/artilheiro só é liberada
// após o prazo das previsões; antes disso esses campos voltam null.
export async function getAuditoriaData() {
  const supabase = createAdminClient();
  const prazoPrevisoesEncerrado = new Date() >= PRAZO_PREVISOES;

  const [perfis, partidas, apostas] = await Promise.all([
    fetchAllRows<{ id: string; nome_completo: string }>((f, t) =>
      supabase.from("perfis").select("id, nome_completo").range(f, t),
    ),
    fetchAllRows((f, t) =>
      supabase
        .from("partidas")
        .select(
          "*, time_a:time_a_id(id,nome,bandeira_url,grupo), time_b:time_b_id(id,nome,bandeira_url,grupo)",
        )
        .order("data_hora")
        .range(f, t),
    ),
    fetchAllRows<{
      user_id: string;
      partida_id: number;
      gols_time_a: number;
      gols_time_b: number;
    }>((f, t) =>
      supabase
        .from("apostas")
        .select("user_id, partida_id, gols_time_a, gols_time_b")
        .range(f, t),
    ),
  ]);

  let podio = null;
  let grupos = null;
  let artilheiro = null;

  if (prazoPrevisoesEncerrado) {
    [podio, grupos, artilheiro] = await Promise.all([
      fetchAllRows((f, t) =>
        supabase
          .from("aposta_podio")
          .select(
            "user_id, posicao, pais_id, pais:pais_id(id, nome, bandeira_url)",
          )
          .range(f, t),
      ),
      fetchAllRows((f, t) =>
        supabase
          .from("previsao_grupo")
          .select(
            "user_id, pais_id, posicao, terceiro_avanca, pais:pais_id(id, nome, bandeira_url, grupo)",
          )
          .range(f, t),
      ),
      fetchAllRows((f, t) =>
        supabase
          .from("apostas_artilheiro")
          .select(
            "user_id, jogador_id, jogador:jogador_id(id, nome, pais:paises(id, nome, bandeira_url))",
          )
          .range(f, t),
      ),
    ]);
  }

  const partidasFechadas = partidas.filter(
    (p) => !apostaAberta((p as { data_hora: string }).data_hora),
  );

  const apostasPorPartida = new Map<number, typeof apostas>();
  for (const a of apostas) {
    if (!apostasPorPartida.has(a.partida_id)) {
      apostasPorPartida.set(a.partida_id, []);
    }
    apostasPorPartida.get(a.partida_id)!.push(a);
  }

  const palpites = partidasFechadas.map((partida) => ({
    partida,
    apostas: apostasPorPartida.get((partida as { id: number }).id) ?? [],
  }));

  return {
    perfis,
    palpites,
    podio,
    grupos,
    artilheiro,
    prazoPrevisoesEncerrado,
  };
}
